const {
    time, // Time support with custom block timeouts
} = require("@openzeppelin/test-helpers");

module.exports = (artifacts) => {
    
    // Project Contracts
    const KateToken = artifacts.require("KateToken");
    const KateTokenSale = artifacts.require("KateTokenSale");

    // Libraries

    // Generic Utilities

    const fromWei = n => web3.utils.fromWei(n, 'ether');

    const toWei = n => web3.utils.toWei(n, 'ether');
    // const toWei = n => parseUnits(n, 18);

    const big = (n) => web3.utils.toBN(n);

    const parseUnits = (units, pow) => big(+units).mul(big(10).pow(big(pow)));

    const log = (v) => console.log("DEBUG: ", v.toString());

    const compare = (a, b) => {
        if (Array.isArray(b)) {
            const deviance = b.pop();
            [b] = b;
            return b.add(deviance).gte(a) && b.sub(deviance).lte(a);
        } else return a.toString() === b.toString();
    };

    const assertBn = (a, b, deviance, debug) => {
        if (deviance) {
            if (debug) {
                log("Upper: " + b.add(deviance).toString());
                log("Lower: " + b.sub(deviance).toString());
                log("Actual: " + a.toString());
                return;
            }
            return (
                assert.ok(b.add(deviance).gte(a)) &&
                assert.ok(b.sub(deviance).lte(a))
            );
        } else return assert.equal(a.toString(), b.toString());
    };

    const assertEvents = ({ logs }, events) => {
        const names = Object.keys(events);
        names.forEach((name) => {
            const specificLogs = logs.filter((log) => log.event === name);

            if (!specificLogs || specificLogs.length === 0)
                assert.fail(`Event ${name} Not Fired`);

            for (let log of specificLogs) {
                if (!Array.isArray(events[name])) events[name] = [events[name]];

                let matched;
                for (let argSet of events[name]) {
                    const args = Object.keys(argSet);
                    matched =
                        matched ||
                        args.every((arg) => {
                            const value = log.args[arg];
                            if (
                                typeof value === "string" &&
                                value !== argSet[arg]
                            ) {
                                if (events[name].length === 1)
                                    assert.fail(
                                        `Event ${name} Argument ${arg} Does Not Match (expected: ${argSet[arg]} vs actual: ${value})`
                                    );

                                return false;
                            } else if (!compare(value, argSet[arg])) {
                                if (events[name].length === 1)
                                    assert.fail(
                                        `Event ${name} Argument ${arg} Does Not Match (expected: ${argSet[arg]} vs actual: ${value})`
                                    );

                                return false;
                            }
                            return true;
                        });
                }

                if (!matched)
                    assert.fail(
                        `Event ${name} Did Not Match Any Argument Sets`
                    );
            }
        });
    };

    const assertErrors = async (p, err, d) => {
        let error = { message: "" };
        try {
            await p;
            if (d) return log("Successfully executed");
        } catch (e) {
            if (d) return log(e.message.slice(0, 500));
            error = e;
        }
        assert.ok(
            Array.isArray(err)
                ? err.some((_err) => error.message.indexOf(_err) !== -1)
                : error.message.indexOf(err) !== -1
        );
    };

    const getNativeBalance = async (a) => big(await web3.eth.getBalance(a));

    const verboseAccounts = async (accounts) => {
        const verboseAccounts = [
            "owner",
            "account1",
            "developmentFund",
            "companyFund",
            "account4",
            "account5"          
        ];
        const usedAccounts = accounts.slice(0, verboseAccounts.length);
        const remaining = accounts.slice(verboseAccounts.length);

        for (let i = 0; i < remaining.length; i++) {
            const balance = await getNativeBalance(remaining[i]);

            if (balance.gt(big(0)))
                for (let j = 0; j < usedAccounts.length; j++)
                    await web3.eth.sendTransaction({
                        from: remaining[i],
                        to: usedAccounts[j],
                        value: balance.div(big(usedAccounts.length)),
                        gasPrice: big(0),
                    });
        }

        return verboseAccounts.reduce((acc, v, i) => {
            acc[v] = usedAccounts[i];
            return acc;
        }, {});
    };
    
    const UNSET_ADDRESS = "0x0000000000000000000000000000000000000000";
    const TEN_UNITS = parseUnits(10, 18);

    // Project Constants

    const PROJECT_CONSTANTS = {};

    const DEFAULT_CONFIGS = {
        KateToken: ({}) => [],
        KateTokenSale: ( { developmentFund, companyFund }, { kateToken } ) => [kateToken.address, developmentFund, companyFund]
    };

    // Project Utilities

    let initialized;
    let cached;

    const deployMock = async (accounts, configs) => {

        configs = { ...DEFAULT_CONFIGS, ...configs };
        if (accounts === undefined) {
            if (cached) return cached;
            
            else {
                log("Incorrect Mock Deployment Invocation");
                process.exit(1);
            }
        }

        if (!initialized) {
            const kateToken = await KateToken.new();
            const kateTokenSale = await KateTokenSale.new(kateToken.address, accounts.developmentFund, accounts.companyFund);
            initialized = true;
        }

        cached = {};

        // Project Deployments
        cached.kateToken = await KateToken.new(...configs.KateToken(accounts, cached));
        cached.kateTokenSale = await KateTokenSale.new(...configs.KateTokenSale(accounts, cached));

        return cached;
    };

    return {
        // Deployment Function
        deployMock,

        // Testing Utilities
        log,
        assertBn,
        assertEvents,
        assertErrors,
        UNSET_ADDRESS,
        TEN_UNITS,

        // Library Functions
        parseUnits,
        getNativeBalance,
        verboseAccounts,
        big,
        time,
        fromWei,
        toWei,

        // Project Specific Constants
        PROJECT_CONSTANTS,
        DEFAULT_CONFIGS,

        // Project Specific Utilities
    };
};
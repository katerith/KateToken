// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

import './shared/ProtocolConstants.sol';


contract KateToken is IERC20, Ownable {

    mapping (address => uint256) private _balances;
    mapping (address => mapping (address => uint256)) private _allowances;
    
    uint256 private _totalSupply;
    
    string private _name;
    string private _symbol;
    uint8 private _decimals;
    address private _owner;

    constructor()  {
        _name = 'KateToken';
        _symbol = 'KTN';
        _decimals = 18;
        _owner = msg.sender;
        _totalSupply = 1000000 * 10 ** _decimals;

        _balances[_owner] =_totalSupply;
      
        emit Transfer(address(0), _owner, _balances[_owner]);
    }

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function decimals() public view returns (uint8) {
        return _decimals;
    }

    function totalSupply() public view override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view override returns (uint256) {
        return _balances[account];
    }

    function transfer(address recipient, uint256 amount) public override returns (bool) {
        _transfer(msg.sender, recipient, amount);
        return true;
    }

    function allowance(address owner_, address spender) public view override returns (uint256) {
        return _allowances[owner_][spender];
    }

    function approve(address spender, uint256 amount) public override returns (bool) {
        _approve(msg.sender, spender, amount);

        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool) {
        require(_allowances[sender][msg.sender] >= amount, "ERC20: transfer amount exceeds allowance");

        _transfer(sender, recipient, amount);
        _approve(sender, msg.sender, _allowances[sender][msg.sender] - amount);

        return true;
    }

    function increaseAllowance(address spender, uint256 addedValue) public returns (bool) {
        require(spender != address(0), "ERC20: transfer to the zero address");

        _allowances[msg.sender][spender] += addedValue;

        emit Approval(msg.sender, spender, _allowances[msg.sender][spender]);
        return true;
    }

    function decreaseAllowance(address spender, uint256 subtractedValue) public returns (bool) {
        require(spender != address(0), "ERC20: transfer to the zero address");
        require(_allowances[msg.sender][spender] >= subtractedValue, "ERC20: decreased allowance below zero");

        _allowances[msg.sender][spender] -= subtractedValue;

        emit Approval(msg.sender, spender, _allowances[msg.sender][spender]);
        return true;
    }

    function _transfer(address sender, address recipient, uint256 amount) internal {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");
        require(_balances[sender] >= amount, "ERC20: transfer amount exceeds balance");

        _balances[sender] -= amount;
        _balances[recipient] += amount;

        emit Transfer(sender, recipient, amount);
    }

    function _mint(uint amount) public onlyOwner {

        _totalSupply += amount;
        _balances[_owner] += amount;

        emit Transfer(address(0), _owner, amount);
    }

    function _burn(uint amount) external onlyOwner {
        require(_balances[_owner] >= amount, "ERC20: burn amount exceeds balance");

        _totalSupply -= amount;
        _balances[_owner] -= amount;

        emit Transfer(_owner, address(0), amount);
    }

    function _approve(address owner_, address spender, uint256 amount) internal {
        require(owner_ != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");
        require(amount <= _balances[owner_], "allowance amount exceeds owner_'s balance");
        require(amount == 0 || _allowances[msg.sender][spender] == 0, "ERC20: The amount must not be zero.");

        _allowances[owner_][spender] = amount;

        emit Approval(owner_, spender, amount);
    }
}

// Private
var userCount = 0;

function depositeMinusFee(num1) {
  return num1 - 0.1;
}


module.exports = User;

function User(n) {
    this.id = userCount;
    this.name = n;
    this._paid = false;
    this.balance = 0;
    userCount++;
}

User.prototype.togglePaid = function() {
  this._paid = !this._paid;
};

User.prototype.userType = function() {
  if(this._paid) return 'Paid User';
  else           return 'Free User';
};

User.prototype.addBalance = function(amount) {
  this.balance += depositeMinusFee(amount);
};

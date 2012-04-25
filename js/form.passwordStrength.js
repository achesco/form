/**
    Determine presumable password strength: value form 0 to 5
    @static
    @param {String} val Строка для анализа.
    @param {Number} minLength Минимальная длинна строки до которой сила всегда равна 0.
 */
form.passwordStrength = function(val, minLength) {

  this.countRegexp = function(val, rex) {
    var match = val.match(rex);
    return match ? match.length : 0;
  }
  
  var len = val.length;

  if (len < minLength) return 0;
    
  var nums = this.countRegexp(val, /\d/g),
    lowers = this.countRegexp(val, /[a-z]/g),
    uppers = this.countRegexp(val, /[A-Z]/g),
    specials = len - nums - lowers - uppers;
  
  if (nums == len || specials == len)
    return 1;
  
  var strength = 0;
  if (nums) { strength+= 2; }
  if (lowers) { strength+= uppers? 2 : 1; }
  if (uppers) { strength+= lowers? 2 : 1; }
  if (specials) { strength+= 2; }
  if (len > 10) { strength+= 1; }
  
  if (strength > 0 && strength <= 2)
    return 2;
  else if (strength > 2 && strength <= 3)
    return 3;
  else if (strength > 3 && strength <= 4)
    return 4;
  else if (strength > 4)
    return 5;
  else
    return 0;
};
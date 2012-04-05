/**
    @class FieldRevealer for password input.
 */
form.FieldRevealer = function(options) {
  var defaults = {
    form : '#form',
    switcher: '#password-cloak',
    revealed: '#input-password-clear',
    hidden: '#input-password-password'
  };
  options = $.extend({}, defaults, options);

  var jForm = $(options.form);
  var jSwitcher = $(options.switcher);
  var jRevealed = $(options.revealed);
  var jHidden = $(options.hidden);

  var oForm = ZForms.getFormById(jForm.attr('id'));
  var oRevealed = oForm.getWidgetById(jRevealed.attr('id'));
  var oHidden = oForm.getWidgetById(jHidden.attr('id'));
  
  jRevealed.keyup(function(){
    oHidden.setValue(oHidden.createValue(oRevealed.getValue().get()));
  });
  jHidden.keyup(function(){
    oRevealed.setValue(oRevealed.createValue(oHidden.getValue().get()));
  });
  jSwitcher.click(function(){
    if(jRevealed.is(':visible'))
    {
      jRevealed.hide();
      jHidden.show();
      jSwitcher.addClass('secret');
    }
    else
    {
      jHidden.hide();
      jRevealed.show();
      jSwitcher.removeClass('secret');
    }
  });
};
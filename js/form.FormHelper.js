/**
 * @class Form helper for ZForms
 * 
 * @author Dmitry Kharchenko, dims@design.ru
 **/
form.FormHelper = function(options) {
  
  var defaults = {
// -- Basic selectors
    advice : '#advice',
    form : '#form',
    widget: 'dl',
    combo: '.combo',
    formatNumber: '.formatted-number',
    agreeBoxIdPart : 'cb-agree',
    descClass : 'description',
    
// -- Misc options
    fade: false,

// -- Intrinsic ZForms classes
    
    invalidClass : 'zf-invalid',
    invalidOkClass : 'zf-invalid-ok',
    requiredClass : 'zf-required',
    requiredOkClass : 'zf-required-ok',
    errorBubbleClass : 'zf-error-bubble',
    
// -- I18n :-)
    
    adviceRequired : 'Нужно',
    adviceTypeIn : 'ввести',
    adviceFix : 'исправить',
    adviceAnd : 'и',
    adviceLeftOne : 'Осталось',
    adviceAgree : 'согласиться с&nbsp;условиями сервиса'
  };
  
  options = $.extend({}, defaults, options);

  // -------------- Public ------------------- //
  
    // == Selectors
  this.jAdvice = $(options.advice);
  this.jForm = $(options.form);
  this.sWidget = options.widget;
  this.jWidget = this.jForm.find(options.widget);
  this.jCombos = this.jForm.find(options.combo);
  this.jFormatted = this.jForm.find(options.formatNumber);
  this.sAgreeId = options.agreeBoxIdPart;
  
  this.oForm = ZForms.getFormById(this.jForm.attr('id'));
  
  this.sDescClass = options.descClass;
  this.sInvalidClass = options.invalidClass;
  this.sInvalidOkClass = options.invalidOkClass;
  this.sRequiredClass = options.requiredClass;
  this.sRequiredOkClass = options.requiredOkClass;
  this.sErrorBubbleClass = options.errorBubbleClass;
  
  this.sRequired = options.adviceRequired;
  this.sTypeIn = options.adviceTypeIn;
  this.sFix = options.adviceFix;
  this.sAnd = options.adviceAnd;
  this.sLeftOne = options.adviceLeftOne;
  this.sAgree = options.adviceAgree;
  
  this.bFade = options.fade;

  ZForms.attachObserver(ZForms.EVENT_TYPE_ON_CHANGE, $.proxy(this.collectAdvice, this), this.oForm);
          
  this.initCombos();
  
  this.jFormatted.bind('keyup change autocomplete blur',
      $.proxy(this.formatNumber.scope, this ) ).each(function(){
    if($(this).attr('maxlength'))
      $(this).data('iMaxLength', $(this).attr('maxlength'));
  });
          
  this.jHintedInputs = this.jWidget.filter(':has(.' + this.sErrorBubbleClass + ')').find('input');
  
  var that = this;
  
  this.jHintedInputs.each(function(){
    
    var jWidget = $(this).closest(that.sWidget);
    
    var jHint = jWidget.find('.' + that.sErrorBubbleClass );
    
    var jInput = $(this);
    
    jInput.bind('keyup change autocomplete', {jHint: jHint,
          jWidget: jWidget}, $.proxy(that.hintedType,that) );
          
    jInput.bind('blur', {jHint: jHint,
          jWidget: jWidget}, $.proxy(that.hintedBlur,that) );
    
    var oWidget = that.oForm.getWidgetById($(this).attr('id'));
    ZForms.attachObserver(ZForms.EVENT_TYPE_ON_INIT, function(){jInput.blur()}, oWidget);
  });

  $('#form-switcher').click( $.proxy(this.collectAdvice, this) );
  
  //Private
  
  //Privileged
  
  //?????
  //PROFIT!!!
};
form.FormHelper.prototype = {
  initCombos : function() {
    var that = this;
    this.jCombos.each(function() {
          var jComboInputs = $(this).find('input');
          var iInputCount = jComboInputs.length;
          jComboInputs.each(function(iIndex) {
                if (iIndex < iInputCount) {
                  $(this).bind('keyup change', {
                        next : jComboInputs.eq(iIndex
                            + 1)
                      }, $.proxy(that.switchInput, that));
                }
                if (iIndex > 0) {
                  $(this).bind('keydown keyup keypress',
                      function(evt) {
                        var field = $(evt.target);
                        if (field.data('tab_locked') === true
                            && evt.keyCode == 9) {
                          // block tab key
                          evt.preventDefault();
                        }
                      });
                }
              });
        });
  },
  
  switchInput : function(event) {
    var field = $(event.target), nextfield = $(event.data.next), last_length = field
        .data('last_length')
        || 0, cur_length = field.val().length, max_length = parseInt(field
        .attr('maxlength'))
        || 3, selection = this._getSelectionRange(field[0]);

    if (cur_length > last_length && cur_length == max_length && selection
        && selection.start == cur_length) {
      // lock Tab key temporarily after jumping to the next field
      nextfield.data('tab_locked', true);
      setTimeout(function() {
            nextfield.data('tab_locked', false);
          }, 1000);

      nextfield.focus();
    }

    field.data('last_length', cur_length);
  },
  
  formatNumber : function(event) {
    var jInput = $(event.target);
    var sVal = jInput.val();

    if (jInput.data('iMaxLength'))
      jInput.attr('maxlength', jInput.data('iMaxLength'));

    sVal = sVal.replace(/\s/g, '');
    sVal += '';
    x = sVal.split(/[.,]/g);
    x1 = x[0];
    x2 = sVal.match(/[.,]/g) ? ',' + (x[1] || '') : '';

    if (event.type == 'blur') {
      if (x2.length == 1)
        x2 = '';
    }

    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ' ' + '$2');
      jInput.attr('maxlength', parseInt(jInput.attr('maxlength')) + 1);
    }

    jInput.val(x1 + x2);
  },

  collectAdvice : function() {
    var invalids = this.jForm.find('.' + this.sInvalidClass)
        .not(':disabled');
    empty = this.jForm.find('.' + this.sRequiredClass).not('.'
        + this.sRequiredOkClass).not('.' + this.sInvalidClass);
    var sDClass = this.sDescClass;
    var that = this;

    // Hide the advice box to reduce repaint count
    this.jAdvice.hide().empty();

    if (invalids.length) {
      this.jAdvice.append(((empty.length > 1)
          ? this.sRequired
          : this.sLeftOne)
          + ' ' + this.sFix + ' ');
      invalids.each(function(index) {
            var sDesc = $(this).find('.' + sDClass);

            var oInput = $(this).find('input');

            sDesc.clone().appendTo(that.jAdvice).click(function() {
                  oInput.focus();
                });
            that.jAdvice
                .append((index < invalids.length - 1)
                    ? ((index == invalids.length - 2 && empty.length != 1)
                        ? ' ' + that.sAnd + '&nbsp;'
                        : ', ')
                    : '');
          });
    }

    if (empty.length) {
      var agreeBox = $(empty).find('[id*=' + this.sAgreeId + ']');

      if (!(empty.length == 1 && agreeBox.length == 1)) {
        if (this.jAdvice.html() == '') {
          this.jAdvice.append(((empty.length > 1)
              ? this.sRequired
              : this.sLeftOne)
              + ' ');
        } else {
          if (agreeBox.length == 0 && empty.length == 1) {
            this.jAdvice.append(' ' + this.sAnd + '&nbsp;');
          } else {
            this.jAdvice.append(', ');
          }
        }
        this.jAdvice.append(this.sTypeIn + ' ');
        empty.each(function(index) {
          var sDesc = $(this).find('.' + sDClass);
          var oInput = $(this).find('input,textarea');
          sDesc.clone().appendTo(that.jAdvice).click(function() {
                oInput.focus();
              });
          that.jAdvice
              .append((index < empty.length - 1)
                  ? ((index == empty.length - 3
                      && agreeBox.length != 0 || (index == empty.length
                      - 2 && agreeBox.length == 0))
                      ? ' ' + that.sAnd + '&nbsp;'
                      : (empty.length > 2 ? ', ' : ''))
                  : '');
        });
      }

      if (agreeBox.length > 0) {
        if (this.jAdvice.html() == '') {
          this.jAdvice.append(this.sLeftOne + ' ');
        } else {
          this.jAdvice.append(' ' + this.sAnd + '&nbsp;');
        }
        this.jAdvice.append(this.sAgree);
      }

    }

    if (invalids.length > 0 || empty.length > 0)
      this.jAdvice.append('.');

    this.jAdvice.show();
  },
  
  hintedBlur : function(event) {
    if (event.data.jWidget.hasClass(this.sInvalidClass)
        && event.data.jHint.is(':hidden')) {
      if (event.data.jWidget.parents().hasClass('combo') || this.bFade)
        event.data.jHint.fadeIn(300);
      else
        event.data.jHint.slideDown(300);
    }
  },

  hintedType : function(event) {
    if (event.data.jWidget.hasClass(this.sInvalidOkClass)
        && event.data.jHint.is(':visible')
        || $(event.target).val() == '') {
      if (event.data.jWidget.parents().hasClass('combo') || this.bFade)
        event.data.jHint.fadeOut(300);
      else
        event.data.jHint.slideUp(300);
    }
  },
  
//  By Sergey Chikuyonok 
  _getSelectionRange : function(elem) {
    if ('selectionStart' in elem) { // W3C's DOM
      return {
        start : elem.selectionStart,
        end : elem.selectionEnd
      };
    } else if (document.selection) { // IE
      elem.focus();

      var range = document.selection.createRange(), content = elem.value;

      if (range === null) {
        return {
          start : 0,
          end : content.length
        };
      }

      var re = elem.createTextRange();
      var rc = re.duplicate();
      re.moveToBookmark(range.getBookmark());
      rc.setEndPoint('EndToStart', re);

      return {
        start : rc.text.length,
        end : rc.text.length + range.text.length
      };
    } else {
      return null;
    }
  }
};
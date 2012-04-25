/**
    Determine presumable password strength: value form 0 to 5
    @static
    @param {Object} options Параметры:
    @param {String|Element|jQuery} [options.inputFields="input[placeholder]"] Инпуты с плейсхолдерами.
    @param {String} [options.classPlaceholder="empty"] Класс поля с активным плейсхолдером.
 */
form.placeholder = function(options) {

	var options = options || {};
    options = $.extend({}, {
    	inputFields: "input[placeholder]",
        classPlaceholder: "empty"
    }, options);

    var abstractInput = document.createElement("input");
    if ("placeholder" in abstractInput)
    	return;

	$(function() {
		$(options.inputFields).each(function() {
			$(this).focus(function() {
				var input = $(this);
				if(input.val() == input.attr("placeholder")) {
					input.val("");
					input.removeClass(options.classPlaceholder);
				}
			}).blur(function() {
				var input = $(this);
				if (input.val() == "" || input.val() == input.attr("placeholder")) {
					input.addClass(options.classPlaceholder);
					input.val(input.attr("placeholder"));
				}
			}).blur();
		});
	});
};
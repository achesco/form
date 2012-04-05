/**
    <p>Класс для ajax-загрузки файлов с zforms интеграцией. Для работы необходимо наличие верстки вида:</p>
 
    <pre><code>
    <form id="id_" name="_form_">
         ...
        <div class="form__file-container">
            <input type="hidden" class="zf" id="_hidden_" name="_hidden_" onclick="return { oRequired: {} }" value="" />
            <div class="form__file-wrapper">
                <input type="file" class="form__file-input" id="_file_" name="_file_" />
                <div class="pretty-button">Загрузить</div>
           </div>
           <div class="form__field-preview">
               <div class="g-icon g-icon_close"></div>
           </div>
           <div class="form__field-comment form__field-comment_req">Принимаются только файлы формата .jpg и&nbsp;.png</div>
        </div>
         ...
    </form>
    </code></pre>
    
    <p>У элементов form и input, учавствующих в работе виджета, должны быть назначены идентификаторы.</p>
    
    <p>Пример вызова:</p>
    
    <pre><code>
      $(function(){
        new FileInput(".form__file-contaner", {
          url: "./file-upload/",
          formId: "participant-form"
        });
      });
    </code></pre>
    
    @author Anton Lysenko (chesco@design.ru)
     
    @constructor
    @param {String|Element|jQuery} container Контейнер попапа.
    @param {Object} options Параметры:
    @param {String} [options.url="."] Урл для отпавки файлов на :).
    @param {String|Element|jQuery} [options.fileField="input[type=file]"] Файловое поле внутри контейнера.
    @param {String|Element|jQuery} [options.valueField="input[type=hidden]"] Поле для хранения пути к файлу на сервере.
    @param {String|Element|jQuery} [options.preview=".form__field-preview"] Элемент для вывода результатов.
    @param {String|Element|jQuery} [options.restartControl=".g-icon_close"] Контрол элемент для сброса выбранного файла. 
    @param {String} [options.classOk="form__file-container_ok"] Класс контейнера, статус ок.
    @param {String} [options.classLoad="form__file-container_load"] Класс контейнера в процессе аплоада.
 */
form.FileInput = function(container, options) {
    this.init(container, options);
};
/**
    Инициализация инстанса.
 */
form.FileInput.prototype.init = function(container, options) {

    options = $.extend({}, {
        url: ".",
        fileField: "input[type=file]",
        valueField: "input[type=hidden]",
        preview: ".form__field-preview",
        restartControl: ".g-icon_close",
        classOk: "form__file-container_ok",
        classLoad: "form__file-container_load"
    }, options);
  
    this.container = $(container);
    this.options = options;
    
    this.fileField = this.container.find(options.fileField);
    this.fileFieldParent = this.fileField.parent();
    
    this.valueWidget = ZForms.getFormById(this.container.parents("form:first").attr("id"))
    .getWidgetById(this.container.find(options.valueField).attr("id"));
    
    this.preview = this.container.find(options.preview);
    this.restartControl = this.container.find(options.restartControl);
 
    this.io = $('<iframe />').css({
        display: "none"
    });
    this.io.attr({
        id: $.identify(this.io),
        name: $.identify(this.io)
    })
    .appendTo(document.body);
  
    this.form = $('<form />').css({
        position: "absolute",
        top: "-1000px"
    });
    this.form.attr({
        id: $.identify(this.form),
        name: $.identify(this.form),
        action: this.options.url,
        method: "post",
        enctype: "multipart/form-data",
        target: $.identify(this.io)
    })
    .appendTo(document.body);
      
    this.fileField.change($.proxy(this.upload, this));
    this.restartControl.live("click", $.proxy(this.restart, this));
};
/**
    Аплоад файла.
*/
form.FileInput.prototype.upload = function() {
    this.form.append(this.fileField)
    this.container.removeClass(this.options.classOk);
    this.container.addClass(this.options.classLoad);
    this.io.one("load", $.proxy(this.complete, this));
    this.form.submit();
};
/**
    Получение и обработка ответа сервера.
*/
form.FileInput.prototype.complete = function(data) {
    var data = $.parseJSON(this.io.contents().find('body').html());
    this.container.removeClass(this.options.classLoad);
    if(typeof data !="undefined"){
        if(data.code == 0){
            this.container.addClass(this.options.classOk);
            this.container.removeClass(this.options.classLoad);
            this.setValue(data.filePath);
            this.preview.html(Base64.decode(data.preview));
        }
    }
};
/**
    Возврат в исходное состояние.
*/
form.FileInput.prototype.restart = function() {
    this.preview.html("");
    this.fileFieldParent.prepend(this.fileField);
    this.container.removeClass(this.options.classOk);
    this.setValue("");
};
/**
    Установка "реального" значения в скрытом поле.
*/
FileInput.prototype.setValue = function(sValue) {
    this.valueWidget.setValue(this.valueWidget.createValue(sValue));
};

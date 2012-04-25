# Кто здесь?

* `js/form.js` Общий неймспейс для функционала форм.

* `js/form.FieldRevealer.js` Функционал "глазик" для полей паролей.  
Зависимости: `js/form.js`, `js/form.FieldRevealer.js`

* `js/form.FileInput.js`, `processes/upload.pp` Функционал динамического аплоада файлов.  
Зависимости: `js/form.js`, `js/base64.js`, `js/jquery.identify.js`, `css/forms.css`  
[Подробности в вики](https://github.com/triangle/form/wiki/form.FileInput)

* `js/form.FormHelper.js` Помощник по формам: резюме заполненных полей, баблы с ошибками.  
Зависимости: `js/form.js`, `css/forms.css`

* `js/form.passwordStrength.js` Статическая функция для простейшего рассчета силы пароля.  
Зависимости: `js/form.js`

* `js/form.placeholder.js` Статическая функция для навеса placeholder в браузерах, 
которые его не поддерживают.  
Зависимости: `js/form.js`

_Всем нужен_ `jquery.js`

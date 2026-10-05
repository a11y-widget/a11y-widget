/*! a11y-widget — standalone accessibility panel. MIT.
 *  One script, no dependencies, no network calls. Preferences stay in the visitor's browser.
 *
 *  <script src="/a11y-widget.js" data-statement="/accessibility" data-color="#1f3a93"></script>
 *
 *  data-lang        en | zh | es | vi   (default: <html lang>)
 *  data-position    right | left        (default: right)
 *  data-statement   URL of your accessibility statement (optional)
 *  data-main        CSS selector for main content (default: "#main, main, [role=main]")
 *  data-color       panel accent colour (default: #1f3a93)
 *  data-key         localStorage key (default: a11y-widget)
 *  data-z           z-index (default: 2147483000)
 *  data-css         "off" to skip injecting styles (then link a11y-widget.css yourself, e.g. under a strict CSP)
 *  data-shortcut    "off" to disable the Alt+Shift+A shortcut
 *
 *  window.A11yWidget: open(), close(), toggle(), reset(), set(partialState), get(), destroy()
 */
(function (global) {
  'use strict';
  if (global.A11yWidget && global.A11yWidget.__loaded) return;

  var script = document.currentScript || (function () { var s = document.getElementsByTagName('script'); return s[s.length - 1]; })();
  var ds = (script && script.dataset) || {};
  var root = document.documentElement;
  var CFG = {
    lang: ds.lang || '',
    position: ds.position === 'left' ? 'left' : 'right',
    statement: ds.statement || '',
    main: ds.main || '#main, main, [role=main]',
    color: ds.color || '#1f3a93',
    key: ds.key || 'a11y-widget',
    z: ds.z || '2147483000',
    css: ds.css !== 'off',
    shortcut: ds.shortcut !== 'off'
  };
  var HIDE_KEY = CFG.key + '-hidden';
  var P = 'a11yw'; // class prefix
  var SIZES = [100, 110, 120, 135, 150, 175];
  var SPACING = [0, 1, 2];
  var CONTRAST = ['none', 'high', 'dark', 'invert'];
  var SAT = ['none', 'gray', 'high'];
  var ALIGN = ['none', 'left', 'center', 'right'];
  var TOGGLES = ['font', 'links', 'headings', 'focus', 'cursor', 'guide', 'mask', 'motion', 'images', 'mute'];
  var PROFILES = {
    vision:  { size: 120, spacing: 1, contrast: 'high', sat: 'none', align: 'none', on: ['font', 'links', 'focus'] },
    reading: { size: 110, spacing: 2, contrast: 'none', sat: 'none', align: 'left', on: ['font', 'guide', 'links', 'motion'] },
    focus:   { size: 100, spacing: 1, contrast: 'none', sat: 'none', align: 'none', on: ['mask', 'motion', 'headings', 'mute'] },
    seizure: { size: 100, spacing: 0, contrast: 'none', sat: 'gray', align: 'none', on: ['motion', 'mute'] },
    motor:   { size: 110, spacing: 0, contrast: 'none', sat: 'none', align: 'none', on: ['focus', 'links', 'cursor'] }
  };

  /* ------------------------------------------------------------------ labels */
  var L = {
    en: { lang: 'en-US', title: 'Accessibility', open: 'Accessibility options', close: 'Close',
      tabProfiles: 'Profiles', tabText: 'Text', tabColor: 'Color', tabReading: 'Reading', tabTools: 'Tools', tabsLabel: 'Accessibility settings',
      visionDesc: 'Larger text, high contrast, readable font, highlighted links', readingDesc: 'Readable font, wide spacing, reading guide, no animations', focusDesc: 'Reading mask, highlighted headings, no animations or sounds', seizureDesc: 'Stops animations and video, grayscale, muted sounds', motorDesc: 'Big cursor, strong focus ring, highlighted links',
      profiles: 'Quick profiles', vision: 'Vision impaired', reading: 'Dyslexia & reading', focus: 'ADHD & focus', seizure: 'Seizure safe', motor: 'Keyboard & motor',
      text: 'Text', textSize: 'Text size', smaller: 'Decrease text size', larger: 'Increase text size',
      spacing: 'Text spacing', spacing0: 'Default', spacing1: 'Moderate', spacing2: 'Wide', font: 'Readable font',
      align: 'Text alignment', alignnone: 'Default', alignleft: 'Left', aligncenter: 'Center', alignright: 'Right',
      color: 'Color', contrast: 'Contrast', contrastnone: 'Default', contrasthigh: 'High', contrastdark: 'Dark', contrastinvert: 'Invert',
      saturation: 'Saturation', satnone: 'Default', satgray: 'Grayscale', sathigh: 'High',
      aids: 'Reading aids', links: 'Highlight links', headings: 'Highlight headings', focusRing: 'Highlight focus', cursor: 'Big cursor', guide: 'Reading guide', mask: 'Reading mask', motion: 'Stop animations', images: 'Hide images', mute: 'Mute sounds',
      tools: 'Tools', read: 'Read page aloud', pause: 'Pause', resume: 'Resume', stop: 'Stop reading', readUnsupported: 'Read aloud is not available in this browser.',
      structure: 'Page structure', headingsList: 'Headings', landmarks: 'Landmarks', lmHeader: 'Header', lmNav: 'Navigation', lmMain: 'Main content', lmAside: 'Sidebar', lmFooter: 'Footer', lmSearch: 'Search', back: 'Back to options', noHeadings: 'No headings found on this page.',
      reset: 'Reset all', moveLeft: 'Move to left', moveRight: 'Move to right', hide: 'Hide panel', hideNote: 'Panel hidden for this visit. It returns on your next visit or with Alt + Shift + A.',
      shortcut: 'Keyboard shortcut: Alt + Shift + A', statement: 'Accessibility statement', on: 'on', off: 'off', profileOn: 'profile applied', profileOff: 'profile cleared' },
    zh: { lang: 'zh-CN', title: '无障碍', open: '无障碍选项', close: '关闭',
      tabProfiles: '方案', tabText: '文字', tabColor: '颜色', tabReading: '阅读', tabTools: '工具', tabsLabel: '无障碍设置',
      visionDesc: '放大文字、高对比度、易读字体、突出链接', readingDesc: '易读字体、宽松间距、阅读标尺、停止动画', focusDesc: '阅读遮罩、突出标题、停止动画与声音', seizureDesc: '停止动画与视频、灰度显示、静音', motorDesc: '大号光标、醒目焦点、突出链接',
      profiles: '快捷方案', vision: '视力障碍', reading: '阅读障碍与阅读', focus: '注意力与专注', seizure: '防癫痫（去除闪烁）', motor: '键盘与行动不便',
      text: '文字', textSize: '文字大小', smaller: '缩小文字', larger: '放大文字',
      spacing: '文字间距', spacing0: '默认', spacing1: '适中', spacing2: '宽松', font: '易读字体',
      align: '文字对齐', alignnone: '默认', alignleft: '左对齐', aligncenter: '居中', alignright: '右对齐',
      color: '颜色', contrast: '对比度', contrastnone: '默认', contrasthigh: '高对比', contrastdark: '深色', contrastinvert: '反转',
      saturation: '饱和度', satnone: '默认', satgray: '灰度', sathigh: '高',
      aids: '阅读辅助', links: '突出显示链接', headings: '突出显示标题', focusRing: '突出显示焦点', cursor: '大号光标', guide: '阅读标尺', mask: '阅读遮罩', motion: '停止动画', images: '隐藏图片', mute: '静音',
      tools: '工具', read: '朗读页面', pause: '暂停', resume: '继续', stop: '停止朗读', readUnsupported: '此浏览器不支持朗读功能。',
      structure: '页面结构', headingsList: '标题', landmarks: '页面区域', lmHeader: '页眉', lmNav: '导航', lmMain: '主要内容', lmAside: '侧栏', lmFooter: '页脚', lmSearch: '搜索', back: '返回选项', noHeadings: '本页未找到标题。',
      reset: '全部重置', moveLeft: '移至左侧', moveRight: '移至右侧', hide: '隐藏面板', hideNote: '本次访问期间已隐藏面板。下次访问或按 Alt + Shift + A 可重新显示。',
      shortcut: '键盘快捷键：Alt + Shift + A', statement: '无障碍声明', on: '已开启', off: '已关闭', profileOn: '方案已应用', profileOff: '方案已取消' },
    es: { lang: 'es-ES', title: 'Accesibilidad', open: 'Opciones de accesibilidad', close: 'Cerrar',
      tabProfiles: 'Perfiles', tabText: 'Texto', tabColor: 'Color', tabReading: 'Lectura', tabTools: 'Herramientas', tabsLabel: 'Ajustes de accesibilidad',
      visionDesc: 'Texto grande, alto contraste, fuente legible, enlaces resaltados', readingDesc: 'Fuente legible, espaciado amplio, guía de lectura, sin animaciones', focusDesc: 'Máscara de lectura, títulos resaltados, sin animaciones ni sonidos', seizureDesc: 'Detiene animaciones y vídeo, escala de grises, silencio', motorDesc: 'Cursor grande, foco visible, enlaces resaltados',
      profiles: 'Perfiles rápidos', vision: 'Baja visión', reading: 'Dislexia y lectura', focus: 'TDAH y concentración', seizure: 'Seguro para epilepsia', motor: 'Teclado y motricidad',
      text: 'Texto', textSize: 'Tamaño del texto', smaller: 'Reducir el texto', larger: 'Aumentar el texto',
      spacing: 'Espaciado del texto', spacing0: 'Normal', spacing1: 'Moderado', spacing2: 'Amplio', font: 'Fuente legible',
      align: 'Alineación del texto', alignnone: 'Normal', alignleft: 'Izquierda', aligncenter: 'Centro', alignright: 'Derecha',
      color: 'Color', contrast: 'Contraste', contrastnone: 'Normal', contrasthigh: 'Alto', contrastdark: 'Oscuro', contrastinvert: 'Invertir',
      saturation: 'Saturación', satnone: 'Normal', satgray: 'Escala de grises', sathigh: 'Alta',
      aids: 'Ayudas de lectura', links: 'Resaltar enlaces', headings: 'Resaltar títulos', focusRing: 'Resaltar el foco', cursor: 'Cursor grande', guide: 'Guía de lectura', mask: 'Máscara de lectura', motion: 'Detener animaciones', images: 'Ocultar imágenes', mute: 'Silenciar sonidos',
      tools: 'Herramientas', read: 'Leer la página en voz alta', pause: 'Pausar', resume: 'Reanudar', stop: 'Detener la lectura', readUnsupported: 'La lectura en voz alta no está disponible en este navegador.',
      structure: 'Estructura de la página', headingsList: 'Títulos', landmarks: 'Regiones', lmHeader: 'Encabezado', lmNav: 'Navegación', lmMain: 'Contenido principal', lmAside: 'Barra lateral', lmFooter: 'Pie de página', lmSearch: 'Búsqueda', back: 'Volver a las opciones', noHeadings: 'No se encontraron títulos en esta página.',
      reset: 'Restablecer todo', moveLeft: 'Mover a la izquierda', moveRight: 'Mover a la derecha', hide: 'Ocultar panel', hideNote: 'Panel oculto durante esta visita. Volverá en la próxima visita o con Alt + Mayús + A.',
      shortcut: 'Atajo de teclado: Alt + Mayús + A', statement: 'Declaración de accesibilidad', on: 'activado', off: 'desactivado', profileOn: 'perfil aplicado', profileOff: 'perfil desactivado' },
    vi: { lang: 'vi-VN', title: 'Trợ năng', open: 'Tùy chọn trợ năng', close: 'Đóng',
      tabProfiles: 'Hồ sơ', tabText: 'Văn bản', tabColor: 'Màu sắc', tabReading: 'Đọc', tabTools: 'Công cụ', tabsLabel: 'Cài đặt trợ năng',
      visionDesc: 'Chữ lớn, tương phản cao, phông dễ đọc, liên kết nổi bật', readingDesc: 'Phông dễ đọc, giãn rộng, thước đọc, không hoạt ảnh', focusDesc: 'Mặt nạ đọc, tiêu đề nổi bật, không hoạt ảnh và âm thanh', seizureDesc: 'Dừng hoạt ảnh và video, thang xám, tắt tiếng', motorDesc: 'Con trỏ lớn, tiêu điểm rõ, liên kết nổi bật',
      profiles: 'Hồ sơ nhanh', vision: 'Thị lực kém', reading: 'Khó đọc & đọc hiểu', focus: 'ADHD & tập trung', seizure: 'An toàn cho động kinh', motor: 'Bàn phím & vận động',
      text: 'Văn bản', textSize: 'Cỡ chữ', smaller: 'Giảm cỡ chữ', larger: 'Tăng cỡ chữ',
      spacing: 'Khoảng cách chữ', spacing0: 'Mặc định', spacing1: 'Vừa', spacing2: 'Rộng', font: 'Phông chữ dễ đọc',
      align: 'Căn lề văn bản', alignnone: 'Mặc định', alignleft: 'Trái', aligncenter: 'Giữa', alignright: 'Phải',
      color: 'Màu sắc', contrast: 'Độ tương phản', contrastnone: 'Mặc định', contrasthigh: 'Cao', contrastdark: 'Tối', contrastinvert: 'Đảo màu',
      saturation: 'Độ bão hòa', satnone: 'Mặc định', satgray: 'Thang xám', sathigh: 'Cao',
      aids: 'Hỗ trợ đọc', links: 'Làm nổi liên kết', headings: 'Làm nổi tiêu đề', focusRing: 'Làm nổi tiêu điểm', cursor: 'Con trỏ lớn', guide: 'Thước đọc', mask: 'Mặt nạ đọc', motion: 'Dừng hoạt ảnh', images: 'Ẩn hình ảnh', mute: 'Tắt âm thanh',
      tools: 'Công cụ', read: 'Đọc trang thành tiếng', pause: 'Tạm dừng', resume: 'Tiếp tục', stop: 'Dừng đọc', readUnsupported: 'Trình duyệt này không hỗ trợ đọc thành tiếng.',
      structure: 'Cấu trúc trang', headingsList: 'Tiêu đề', landmarks: 'Vùng trang', lmHeader: 'Đầu trang', lmNav: 'Điều hướng', lmMain: 'Nội dung chính', lmAside: 'Thanh bên', lmFooter: 'Chân trang', lmSearch: 'Tìm kiếm', back: 'Quay lại tùy chọn', noHeadings: 'Không tìm thấy tiêu đề nào trên trang này.',
      reset: 'Đặt lại tất cả', moveLeft: 'Chuyển sang trái', moveRight: 'Chuyển sang phải', hide: 'Ẩn bảng', hideNote: 'Bảng đã ẩn trong lần truy cập này. Sẽ hiện lại ở lần truy cập sau hoặc khi nhấn Alt + Shift + A.',
      shortcut: 'Phím tắt: Alt + Shift + A', statement: 'Tuyên bố trợ năng', on: 'bật', off: 'tắt', profileOn: 'đã áp dụng hồ sơ', profileOff: 'đã bỏ hồ sơ' }
  };
  function pickLang() {
    var l = (CFG.lang || root.getAttribute('lang') || navigator.language || 'en').toLowerCase();
    if (l.indexOf('zh') === 0) return 'zh';
    if (l.indexOf('es') === 0) return 'es';
    if (l.indexOf('vi') === 0) return 'vi';
    return 'en';
  }
  var t = L[pickLang()];

  /* ------------------------------------------------------------------ styles */
  var CSS = /*A11YW_CSS_START*/`
/* a11y-widget styles. Mode classes live on <html>; the panel uses fixed colours so it stays legible in every mode. */
html.a11yw-text-1{font-size:110%!important}html.a11yw-text-2{font-size:120%!important}html.a11yw-text-3{font-size:135%!important}html.a11yw-text-4{font-size:150%!important}html.a11yw-text-5{font-size:175%!important}
html.a11yw-spacing-1 body :not(.a11yw,.a11yw *){line-height:1.7!important;letter-spacing:.04em!important;word-spacing:.1em!important}
html.a11yw-spacing-2 body :not(.a11yw,.a11yw *){line-height:1.9!important;letter-spacing:.12em!important;word-spacing:.16em!important}
html.a11yw-spacing-2 body p{margin-bottom:2em!important}
html.a11yw-font body,html.a11yw-font body :not(.a11yw,.a11yw *){font-family:Verdana,"Atkinson Hyperlegible",Tahoma,Arial,sans-serif!important}
html.a11yw-align-left body :not(.a11yw,.a11yw *){text-align:left!important}
html.a11yw-align-center body :not(.a11yw,.a11yw *){text-align:center!important}
html.a11yw-align-right body :not(.a11yw,.a11yw *){text-align:right!important}
html.a11yw-contrast-high body{background:#fff!important;color:#000!important}
html.a11yw-contrast-high body :not(.a11yw,.a11yw *,img,svg,svg *,video,picture,canvas,iframe){color:#000!important;background-color:#fff!important;background-image:none!important;border-color:#000!important;text-shadow:none!important;box-shadow:none!important;opacity:1!important}
html.a11yw-contrast-high body a:not(.a11yw a){color:#0000cc!important;text-decoration:underline!important}
html.a11yw-contrast-high body :is(button,[role=button],input,select,textarea):not(.a11yw *){border:2px solid #000!important}
html.a11yw-contrast-high body svg:not(.a11yw svg){color:#000!important}
html.a11yw-contrast-dark{background:#0b0f14!important}
html.a11yw-contrast-dark body{background:#0b0f14!important;color:#f2f4f7!important}
html.a11yw-contrast-dark body :not(.a11yw,.a11yw *,img,svg,svg *,video,picture,canvas,iframe){color:#f2f4f7!important;background-color:#0b0f14!important;background-image:none!important;border-color:#4a5663!important;text-shadow:none!important;box-shadow:none!important}
html.a11yw-contrast-dark body a:not(.a11yw a){color:#9cc7ff!important;text-decoration:underline!important}
html.a11yw-contrast-dark body :is(button,[role=button],input,select,textarea):not(.a11yw *){border:2px solid #9cc7ff!important}
html.a11yw-contrast-dark body svg:not(.a11yw svg){color:#f2f4f7!important}
html.a11yw-contrast-dark body img:not(.a11yw img){background:#fff}
html.a11yw-contrast-invert{background:#fff;filter:invert(1) hue-rotate(180deg)}
html.a11yw-contrast-invert :is(img,video,picture,canvas,iframe):not(.a11yw *),html.a11yw-contrast-invert .a11yw{filter:invert(1) hue-rotate(180deg)}
html.a11yw-sat-gray{filter:grayscale(1)}html.a11yw-sat-high{filter:saturate(2.2)}
html.a11yw-contrast-invert.a11yw-sat-gray{filter:invert(1) hue-rotate(180deg) grayscale(1)}
html.a11yw-contrast-invert.a11yw-sat-high{filter:invert(1) hue-rotate(180deg) saturate(2.2)}
html.a11yw-links body a:not(.a11yw a){background:#ffe866!important;color:#001a4d!important;text-decoration:underline!important;text-decoration-thickness:2px!important;outline:2px solid #001a4d!important;outline-offset:1px!important;border-radius:2px}
html.a11yw-headings body :is(h1,h2,h3,h4,h5,h6):not(.a11yw *){outline:2px solid #1f3a93!important;outline-offset:4px!important;text-decoration:underline!important;text-decoration-thickness:3px!important;text-decoration-color:#e0b43b!important;text-underline-offset:6px!important;border-radius:2px}
html.a11yw-focus :focus:not(.a11yw *){outline:4px solid #d60000!important;outline-offset:3px!important;box-shadow:0 0 0 8px #fff!important}
html.a11yw-cursor,html.a11yw-cursor *{cursor:url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24'%3E%3Cpath d='M5 3l14 9-6.2 1.2L16 19.5l-2.4 1.2-3.3-6.4L5 18z' fill='%23000' stroke='%23fff' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E") 6 4,auto!important}
html.a11yw-cursor :is(a,button,summary,[role=button],input[type=submit],input[type=button],label[for]){cursor:url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24'%3E%3Cpath d='M9 2.5c.8 0 1.4.6 1.4 1.4v6.1h.6V8.4c0-.8.6-1.4 1.4-1.4s1.4.6 1.4 1.4v1.9h.6V9.2c0-.8.6-1.4 1.4-1.4s1.4.6 1.4 1.4v1.2h.6v-.3c0-.8.6-1.4 1.4-1.4s1.4.6 1.4 1.4V16c0 3.3-2.7 6-6 6h-1.4c-2 0-3.8-1-4.9-2.6L4.5 15c-.5-.7-.3-1.6.4-2 .6-.4 1.4-.3 1.9.3l.8 1V3.9c0-.8.6-1.4 1.4-1.4z' fill='%23000' stroke='%23fff' stroke-width='1.3' stroke-linejoin='round'/%3E%3C/svg%3E") 14 4,pointer!important}
html.a11yw-motion *,html.a11yw-motion *::before,html.a11yw-motion *::after{animation:none!important;transition:none!important}
html.a11yw-motion{scroll-behavior:auto!important}
html.a11yw-images body :is(img,picture,video,svg[role=img],[style*="background-image"]):not(.a11yw *){opacity:0!important}
body>.a11yw-guide-bar{position:fixed;left:0;right:0;height:44px;background:rgba(255,232,102,.3);border-top:2px solid #1f3a93;border-bottom:2px solid #1f3a93;pointer-events:none;z-index:var(--a11yw-z)}
body>.a11yw-mask-pane{position:fixed;left:0;right:0;background:rgba(0,0,0,.62);pointer-events:none;z-index:var(--a11yw-z)}
body>.a11yw-mask-top{top:0}body>.a11yw-mask-bottom{bottom:0}
body>.a11yw-guide-bar[hidden],body>.a11yw-mask-pane[hidden]{display:none!important}
.a11yw-reading{outline:3px solid #e0b43b!important;outline-offset:6px!important;background:#fff8d6!important;color:#1a1a1a!important;border-radius:10px}
.a11yw{position:fixed;right:20px;bottom:20px;z-index:var(--a11yw-z);font:16px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#262b33;--a11yw-rule:#dfe4ec;--a11yw-grey:#e9edf4;--a11yw-line:#cfd6e1;--a11yw-text2:#525c6b;--a11yw-tint:color-mix(in srgb,var(--a11yw-primary) 10%,#fff);--a11yw-tint2:color-mix(in srgb,var(--a11yw-primary) 22%,#fff);text-align:left;letter-spacing:0;word-spacing:0;line-height:1.5}
.a11yw *{box-sizing:border-box;font-family:inherit;letter-spacing:inherit;word-spacing:inherit;line-height:inherit;text-align:left;text-transform:none}
.a11yw.a11yw-left{right:auto;left:20px}
.a11yw[hidden]{display:none!important}
.a11yw-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.a11yw-toggle{position:relative;width:58px;height:58px;border-radius:50%;border:0;background:linear-gradient(145deg,color-mix(in srgb,var(--a11yw-primary) 80%,#fff),var(--a11yw-primary) 60%,color-mix(in srgb,var(--a11yw-primary) 80%,#000));color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 10px 24px rgba(0,0,0,.2),0 2px 6px rgba(0,0,0,.12),inset 0 1px 0 rgba(255,255,255,.35);padding:0;margin:0;transition:transform .2s,box-shadow .2s}
.a11yw-toggle:hover{transform:translateY(-2px) scale(1.04);box-shadow:0 14px 30px rgba(0,0,0,.24),0 3px 8px rgba(0,0,0,.12),inset 0 1px 0 rgba(255,255,255,.35)}
.a11yw-toggle:focus-visible{outline:3px solid var(--a11yw-primary);outline-offset:4px}
html.a11yw-active .a11yw-toggle::after{content:'';position:absolute;top:0;right:0;width:15px;height:15px;border-radius:50%;background:#f3c552;border:2.5px solid #fff}
.a11yw-panel{position:absolute;right:0;bottom:72px;width:356px;max-width:calc(100vw - 40px);max-height:calc(100dvh - 112px);overflow:auto;overscroll-behavior:contain;scrollbar-width:thin;background:#fff;color:#262b33;border:0;border-radius:26px;box-shadow:0 24px 60px rgba(0,0,0,.18),0 4px 14px rgba(0,0,0,.08),0 0 0 1px rgba(0,0,0,.04);padding:18px 18px 18px;font-size:16px}
.a11yw.a11yw-left .a11yw-panel{right:auto;left:0}
.a11yw-panel[hidden]{display:none!important}
.a11yw-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 10px;padding:0 0 12px;border-bottom:1px solid var(--a11yw-rule)}
.a11yw-title{display:flex;align-items:center;gap:10px;font-size:17px;font-weight:700;color:#262b33;margin:0;padding:0}
.a11yw-title::before{content:'';flex:none;width:12px;height:12px;border-radius:50%;background:var(--a11yw-primary);box-shadow:0 0 0 4px var(--a11yw-tint)}
.a11yw-title:focus{outline:none}
.a11yw-close{border:1px solid var(--a11yw-line);background:var(--a11yw-grey);color:#262b33;font-size:24px;line-height:1;width:40px;height:40px;cursor:pointer;border-radius:50%;padding:0;display:flex;align-items:center;justify-content:center;transition:background .2s}
.a11yw-close:hover{background:var(--a11yw-tint2)}
.a11yw-tabs{display:flex;gap:2px;background:var(--a11yw-grey);border:1px solid var(--a11yw-line);border-radius:999px;padding:3px;margin:0 0 12px}
.a11yw-tab{position:relative;flex:1;min-height:38px;padding:4px 6px;border:0;background:transparent;color:#3a4250;font-size:13px;font-weight:600;line-height:1.2;cursor:pointer;border-radius:999px;text-align:center!important;white-space:nowrap;transition:background .2s,color .2s,box-shadow .2s}
.a11yw-tab:hover{color:var(--a11yw-primary)}
.a11yw-tab[aria-selected=true]{background:#fff;color:var(--a11yw-primary);box-shadow:0 1px 4px rgba(0,0,0,.18),0 0 0 1px var(--a11yw-line)}
.a11yw-tab[data-dot=true]::after{content:'';position:absolute;top:6px;right:8px;width:7px;height:7px;border-radius:50%;background:#f3c552;box-shadow:0 0 0 2px #fff}
.a11yw-tabpanel[hidden]{display:none!important}
.a11yw-tabpanel:focus{outline:none}
.a11yw-group{padding:4px 0 8px;border:0;margin:0}
.a11yw-ico{flex:none;display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;background:#fff;color:var(--a11yw-primary);box-shadow:0 0 0 1px var(--a11yw-line),0 1px 3px rgba(0,0,0,.08)}
.a11yw-profile .a11yw-ico{width:38px;height:38px}
.a11yw-profile-text{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}
.a11yw-profile-text strong{font-size:14px;font-weight:700;line-height:1.25;color:#262b33}
.a11yw-profile-text small{font-size:12px;line-height:1.35;color:var(--a11yw-text2)}
.a11yw-profile[aria-pressed=true] .a11yw-profile-text strong,.a11yw-profile[aria-pressed=true] .a11yw-profile-text small{color:#fff}
.a11yw-profile[aria-pressed=true] .a11yw-ico{background:rgba(255,255,255,.18);color:#fff;box-shadow:none}
.a11yw-profile-check{flex:none;width:22px;height:22px;border-radius:50%;background:#fff;color:var(--a11yw-primary);display:none;align-items:center;justify-content:center}
.a11yw-profile[aria-pressed=true] .a11yw-profile-check{display:inline-flex}
.a11yw-tiles{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.a11yw-tile{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:10px;min-height:88px;padding:12px 12px 10px;border:1px solid var(--a11yw-line);background:var(--a11yw-grey);color:#262b33;font-size:13.5px;font-weight:600;line-height:1.25;cursor:pointer;border-radius:18px;transition:background .2s,box-shadow .2s}
.a11yw-tile:hover{background:var(--a11yw-tint2)}
.a11yw-tile[aria-pressed=true]{background:var(--a11yw-tint);box-shadow:inset 0 0 0 2px var(--a11yw-primary)}
.a11yw-tile[aria-pressed=true] .a11yw-ico{background:var(--a11yw-primary);color:#fff}
.a11yw-tile::after{content:'';position:absolute;top:12px;right:12px;width:10px;height:10px;border-radius:50%;background:#aab4c2;transition:background .2s}
.a11yw-tile[aria-pressed=true]::after{background:var(--a11yw-primary);box-shadow:0 0 0 3px var(--a11yw-tint2)}
.a11yw-tile-label{text-align:left}
.a11yw-tile:last-child:nth-child(odd){grid-column:1/-1;flex-direction:row;align-items:center;min-height:64px}
.a11yw-group-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.14em;color:var(--a11yw-text2);margin:0 0 8px 2px}
.a11yw-profiles{display:grid;grid-template-columns:1fr;gap:8px}
.a11yw-profile{display:flex;align-items:center;gap:12px;width:100%;min-height:60px;padding:10px 14px 10px 10px;border:1px solid var(--a11yw-line);background:var(--a11yw-grey);color:#262b33;cursor:pointer;border-radius:999px;text-align:left;transition:background .2s,color .2s}
.a11yw-profile:hover{background:var(--a11yw-tint2)}
.a11yw-profile[aria-pressed=true]{background:var(--a11yw-primary);color:#fff;border-color:var(--a11yw-primary)}
.a11yw-row{display:grid;grid-template-columns:1fr auto auto auto;align-items:center;gap:8px;padding:2px 0 10px}
.a11yw-label{font-size:14px;color:#262b33;font-weight:500;padding-left:2px}
.a11yw-step{width:40px;height:40px;min-width:40px;border:1px solid var(--a11yw-tint2);background:var(--a11yw-tint);color:var(--a11yw-primary);font-size:15px;font-weight:700;line-height:1;cursor:pointer;border-radius:50%;transition:background .2s,color .2s}
.a11yw-step:hover:not(:disabled){background:var(--a11yw-primary);color:#fff}
.a11yw-step:disabled{opacity:.35;cursor:default}
.a11yw-output{min-width:52px;text-align:center;font-size:14px;font-weight:600;font-variant-numeric:tabular-nums}
.a11yw-seg{display:grid;grid-template-columns:1fr;gap:6px;padding:2px 0 10px}
.a11yw-seg-buttons{display:flex;gap:2px;background:var(--a11yw-grey);border:1px solid var(--a11yw-line);border-radius:999px;padding:3px}
.a11yw-seg-btn{flex:1;min-height:36px;padding:4px 8px;border:0;background:transparent;color:#3a4250;font-size:13px;font-weight:600;line-height:1.2;cursor:pointer;border-radius:999px;text-align:center!important;transition:background .2s,color .2s,box-shadow .2s}
.a11yw-seg-btn:hover{color:var(--a11yw-primary)}
.a11yw-seg-btn[aria-pressed=true]{background:#fff;color:var(--a11yw-primary);box-shadow:0 1px 4px rgba(0,0,0,.18),0 0 0 1px var(--a11yw-line)}
.a11yw-toggles{display:grid;gap:6px}
.a11yw-option{position:relative;display:flex;align-items:center;justify-content:flex-start;gap:12px;width:100%;min-height:50px;padding:8px 10px 8px 8px;border:1px solid var(--a11yw-line);background:var(--a11yw-grey);color:#262b33;font-size:14.5px;font-weight:500;line-height:1.3;cursor:pointer;border-radius:999px;margin:0;transition:background .2s,color .2s,box-shadow .2s}
.a11yw-option:hover{background:var(--a11yw-tint2)}
.a11yw-option::after{content:'';flex:none;margin-left:auto;width:44px;height:26px;border-radius:999px;background:#aab4c2;transition:background .2s}
.a11yw-option::before{content:'';position:absolute;top:50%;right:31px;width:20px;height:20px;margin-top:-10px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.25);transition:right .2s}
.a11yw-option[aria-pressed=true]{background:var(--a11yw-tint);border-color:var(--a11yw-tint2)}
.a11yw-option[aria-pressed=true]::after{background:var(--a11yw-primary)}
.a11yw-option[aria-pressed=true]::before{right:13px}
.a11yw-tool{background:#fff;border-color:var(--a11yw-primary);box-shadow:none;color:var(--a11yw-primary);font-weight:600;justify-content:flex-start;padding:8px 16px 8px 8px}
.a11yw-tool .a11yw-ico{background:var(--a11yw-tint)}
.a11yw-tool[aria-pressed=true] .a11yw-ico{background:rgba(255,255,255,.18);color:#fff;box-shadow:none}
.a11yw-tool::after,.a11yw-tool::before{display:none}
.a11yw-tool:hover{background:var(--a11yw-tint)}
.a11yw-tool[aria-pressed=true]{background:var(--a11yw-primary);color:#fff}
.a11yw-option:disabled{opacity:.5;cursor:default}
.a11yw-option[hidden]{display:none!important}
.a11yw-note{font-size:12px;color:var(--a11yw-text2);margin:4px 4px 0;line-height:1.5}
.a11yw-list{list-style:none;margin:0 0 12px;padding:0;display:grid;gap:4px}
.a11yw-list li{margin:0;padding:0}
.a11yw-link{display:block;width:100%;min-height:40px;padding:8px 16px;border:1px solid var(--a11yw-line);background:var(--a11yw-grey);color:var(--a11yw-primary);font-size:14px;font-weight:500;line-height:1.3;cursor:pointer;border-radius:999px;transition:background .2s}
.a11yw-link:hover{background:var(--a11yw-tint2)}
.a11yw-h2{margin-left:14px;width:calc(100% - 14px)}.a11yw-h3{margin-left:28px;width:calc(100% - 28px);font-size:13px}.a11yw-h4,.a11yw-h5,.a11yw-h6{margin-left:42px;width:calc(100% - 42px);font-size:13px}
.a11yw-foot{margin-top:6px;padding-top:12px;border-top:1px solid var(--a11yw-rule);display:grid;gap:10px}
.a11yw-foot-row{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px}
.a11yw-foot .a11yw-reset{flex:none}
.a11yw-foot-row .a11yw-note{margin:0}
.a11yw-reset{flex:1;border:1px solid var(--a11yw-tint2);background:var(--a11yw-tint);color:var(--a11yw-primary);min-height:38px;padding:6px 12px;font-size:13px;font-weight:600;line-height:1;cursor:pointer;border-radius:999px;text-align:center!important;white-space:nowrap;transition:background .2s,color .2s}
.a11yw-structure .a11yw-reset{flex:none;width:100%}
.a11yw-reset:hover{background:var(--a11yw-primary);color:#fff}
.a11yw-statement{font-size:13px;font-weight:600;color:var(--a11yw-primary);text-decoration:none;border-bottom:1.5px solid var(--a11yw-tint2)}
.a11yw-statement:hover{border-bottom-color:var(--a11yw-primary)}
.a11yw button:focus-visible,.a11yw a:focus-visible{outline:2.5px solid var(--a11yw-primary);outline-offset:2px}
@supports not (color:color-mix(in srgb,#000 10%,#fff)){.a11yw{--a11yw-tint:#e8ecf7;--a11yw-tint2:#cfd8ee}}
@media (max-width:480px){.a11yw{right:14px;bottom:14px}.a11yw.a11yw-left{left:14px}.a11yw-panel{bottom:70px;width:calc(100vw - 28px);padding:14px;border-radius:22px}.a11yw-tab{font-size:12px;padding:4px 2px}}
@media (prefers-reduced-motion:reduce){.a11yw *,.a11yw-toggle{transition:none!important}.a11yw-toggle:hover{transform:none}}
@media (forced-colors:active){.a11yw-toggle,.a11yw-option,.a11yw-profile,.a11yw-seg-btn,.a11yw-step,.a11yw-reset,.a11yw-link{border:1px solid ButtonText}.a11yw-option::after{border:1px solid ButtonText}}
@media print{.a11yw,.a11yw-guide-bar,.a11yw-mask-pane{display:none!important}}
`/*A11YW_CSS_END*/;

  /* ------------------------------------------------------------------ state */
  var ui = null, overlays = null, state = load();
  function defaults() { return { size: 100, spacing: 0, contrast: 'none', sat: 'none', align: 'none', on: [], side: CFG.position, profile: null }; }
  function load() {
    var s = {}, d = defaults();
    try { s = JSON.parse(localStorage.getItem(CFG.key) || '{}') || {}; } catch (e) { s = {}; }
    return {
      size: SIZES.indexOf(s.size) > -1 ? s.size : d.size,
      spacing: SPACING.indexOf(s.spacing) > -1 ? s.spacing : d.spacing,
      contrast: CONTRAST.indexOf(s.contrast) > -1 ? s.contrast : d.contrast,
      sat: SAT.indexOf(s.sat) > -1 ? s.sat : d.sat,
      align: ALIGN.indexOf(s.align) > -1 ? s.align : d.align,
      on: Array.isArray(s.on) ? s.on.filter(function (k) { return TOGGLES.indexOf(k) > -1; }) : [],
      side: s.side === 'left' || s.side === 'right' ? s.side : d.side,
      profile: PROFILES[s.profile] ? s.profile : null
    };
  }
  function save() { try { localStorage.setItem(CFG.key, JSON.stringify(state)); } catch (e) { /* storage unavailable */ } }
  function isOn(k) { return state.on.indexOf(k) > -1; }
  function isDefault() { var d = defaults(); return state.size === d.size && state.spacing === d.spacing && state.contrast === d.contrast && state.sat === d.sat && state.align === d.align && state.on.length === 0; }

  function apply() {
    SIZES.forEach(function (s, i) { root.classList.toggle(P + '-text-' + i, i > 0 && s === state.size); });
    SPACING.forEach(function (v) { root.classList.toggle(P + '-spacing-' + v, v > 0 && v === state.spacing); });
    CONTRAST.forEach(function (v) { root.classList.toggle(P + '-contrast-' + v, v !== 'none' && v === state.contrast); });
    SAT.forEach(function (v) { root.classList.toggle(P + '-sat-' + v, v !== 'none' && v === state.sat); });
    ALIGN.forEach(function (v) { root.classList.toggle(P + '-align-' + v, v !== 'none' && v === state.align); });
    TOGGLES.forEach(function (k) { root.classList.toggle(P + '-' + k, isOn(k)); });
    root.classList.toggle(P + '-active', !isDefault());
    mediaControl();
    if (overlays) overlays.update();
    if (!ui) return;
    ui.wrap.classList.toggle(P + '-left', state.side === 'left');
    ui.output.textContent = state.size + '%';
    ui.smaller.disabled = state.size === SIZES[0];
    ui.larger.disabled = state.size === SIZES[SIZES.length - 1];
    Object.keys(ui.pressed).forEach(function (key) {
      var parts = key.split(':'), on = false;
      if (parts[0] === 'toggle') on = isOn(parts[1]);
      else if (parts[0] === 'spacing') on = state.spacing === Number(parts[1]);
      else if (parts[0] === 'contrast') on = state.contrast === parts[1];
      else if (parts[0] === 'sat') on = state.sat === parts[1];
      else if (parts[0] === 'align') on = state.align === parts[1];
      else if (parts[0] === 'profile') on = state.profile === parts[1];
      ui.pressed[key].setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    ui.side.textContent = state.side === 'left' ? t.moveRight : t.moveLeft;
    if (ui.tabs) {
      var d = defaults();
      var dots = { profiles: !!state.profile, text: state.size !== d.size || state.spacing !== d.spacing || state.align !== d.align || isOn('font'), color: state.contrast !== d.contrast || state.sat !== d.sat, reading: ['links', 'headings', 'focus', 'cursor', 'guide', 'mask', 'motion', 'images', 'mute'].some(isOn), tools: false };
      Object.keys(dots).forEach(function (k) { if (ui.tabs[k]) ui.tabs[k].setAttribute('data-dot', dots[k] ? 'true' : 'false'); });
    }
  }
  /* Pause media when animations are stopped; mute media when sounds are muted. */
  var mediaObserver = null;
  function mediaControl() {
    var media = document.querySelectorAll('video,audio');
    Array.prototype.forEach.call(media, function (m) {
      if (isOn('motion') && m.tagName === 'VIDEO' && !m.paused) { m.pause(); m.setAttribute('data-a11yw-paused', ''); }
      if (isOn('mute')) { if (!m.muted) { m.muted = true; m.setAttribute('data-a11yw-muted', ''); } }
      else if (m.hasAttribute('data-a11yw-muted')) { m.muted = false; m.removeAttribute('data-a11yw-muted'); }
    });
    if ((isOn('motion') || isOn('mute')) && !mediaObserver && 'MutationObserver' in global && document.body) {
      mediaObserver = new MutationObserver(function () { mediaControl(); });
      mediaObserver.observe(document.body, { childList: true, subtree: true });
    }
  }
  apply(); // before first paint so saved preferences do not flash

  /* ------------------------------------------------------------------ helpers */
  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k];
      else if (k === 'html') n.innerHTML = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function announce(msg) { if (ui) { ui.live.textContent = ''; setTimeout(function () { ui.live.textContent = msg; }, 30); } }
  function mainEl() { return document.querySelector(CFG.main) || document.body; }
  function ico(paths) { return '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + paths + '</svg>'; }
  var I = {
    vision: ico('<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
    reading: ico('<path d="M4 5a2 2 0 0 1 2-2h5v16H6a2 2 0 0 0-2 2z"/><path d="M20 5a2 2 0 0 0-2-2h-5v16h5a2 2 0 0 1 2 2z"/>'),
    focus: ico('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>'),
    seizure: ico('<path d="M13 2 5 14h6l-1 8 9-12h-6z"/><path d="M4 4l16 16"/>'),
    motor: ico('<rect x="2" y="6" width="20" height="12" rx="2.5"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>'),
    size: ico('<path d="M4 19 10 5l6 14M6.3 14h7.4"/><path d="M17 12l2-4 2 4M17.8 10.4h2.4"/>'),
    spacing: ico('<path d="M4 5v14M20 5v14M8 12h8M10 10l-2 2 2 2M14 10l2 2-2 2"/>'),
    align: ico('<path d="M4 6h16M4 10h10M4 14h16M4 18h10"/>'),
    font: ico('<path d="M5 19 12 4l7 15M8.3 13h7.4"/>'),
    contrast: ico('<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none"/>'),
    sat: ico('<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>'),
    links: ico('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
    headings: ico('<path d="M5 5v14M13 5v14M5 12h8M17 10.5l2-1.5v10"/>'),
    focusRing: ico('<rect x="7.5" y="7.5" width="9" height="9" rx="2"/><path d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3"/>'),
    cursor: ico('<path d="M5 3l14 9-6.2 1.2L16 19.5l-2.4 1.2-3.3-6.4L5 18z"/>'),
    guide: ico('<path d="M3 7h18M3 17h18"/><rect x="3" y="10" width="18" height="4" rx="1" fill="currentColor" stroke="none" opacity=".35"/>'),
    mask: ico('<rect x="3" y="4" width="18" height="16" rx="2.5"/><rect x="3" y="10" width="18" height="4" fill="currentColor" stroke="none" opacity=".35"/>'),
    motion: ico('<rect x="6" y="5" width="4" height="14" rx="1.2"/><rect x="14" y="5" width="4" height="14" rx="1.2"/>'),
    images: ico('<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3 18l5-5 4 4 3-3 6 6"/><circle cx="16" cy="9" r="1.3"/>'),
    mute: ico('<path d="M11 5 6 9H3v6h3l5 4z"/><path d="M16 9l5 6M21 9l-5 6"/>'),
    read: ico('<path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>'),
    structure: ico('<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1" fill="currentColor"/><circle cx="3.5" cy="12" r="1" fill="currentColor"/><circle cx="3.5" cy="18" r="1" fill="currentColor"/>'),
    check: ico('<path d="M5 12.5l4.5 4.5L19 7.5"/>')
  };
  var ICON = '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" focusable="false">'
    + '<circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" stroke-width="1.6"/>'
    + '<circle cx="12" cy="6.6" r="1.6" fill="currentColor"/>'
    + '<path d="M6.5 9.3 12 10.4l5.5-1.1M12 10.4v4.2M12 14.6 9.6 19M12 14.6l2.4 4.4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>'
    + '</svg>';

  function injectCss() {
    if (!CFG.css || document.getElementById('a11yw-style')) return;
    var probe = el('span', { 'class': 'a11yw-sr a11yw-probe' }); document.head.appendChild(probe);
    var already = getComputedStyle(probe).position === 'absolute'; probe.remove();
    if (already) return; // a linked a11y-widget.css is present
    var st = el('style', { id: 'a11yw-style', text: CSS });
    if (script && script.nonce) st.nonce = script.nonce;
    document.head.appendChild(st);
  }

  /* ------------------------------------------------------------------ guide and mask */
  function makeOverlays() {
    var guide = el('div', { 'class': 'a11yw-guide-bar', 'aria-hidden': 'true', hidden: '' });
    var top = el('div', { 'class': 'a11yw-mask-pane a11yw-mask-top', 'aria-hidden': 'true', hidden: '' });
    var bottom = el('div', { 'class': 'a11yw-mask-pane a11yw-mask-bottom', 'aria-hidden': 'true', hidden: '' });
    [guide, top, bottom].forEach(function (n) { n.style.setProperty('--a11yw-z', String(Number(CFG.z) - 2)); document.body.appendChild(n); });
    var y = global.innerHeight / 2, bound = false;
    function place() {
      if (isOn('guide')) guide.style.top = (y - 22) + 'px';
      if (isOn('mask')) { top.style.height = Math.max(0, y - 70) + 'px'; bottom.style.top = (y + 70) + 'px'; }
    }
    function move(e) { y = e.touches ? e.touches[0].clientY : e.clientY; place(); }
    overlays = {
      els: [guide, top, bottom],
      update: function () {
        guide.hidden = !isOn('guide'); top.hidden = bottom.hidden = !isOn('mask');
        if ((isOn('guide') || isOn('mask')) && !bound) { document.addEventListener('mousemove', move, { passive: true }); document.addEventListener('touchmove', move, { passive: true }); bound = true; }
        place();
      }
    };
    overlays.update();
  }

  /* ------------------------------------------------------------------ read aloud */
  var speech = { items: [], i: 0, active: false, current: null };
  var canSpeak = 'speechSynthesis' in global && 'SpeechSynthesisUtterance' in global;
  function readable() {
    var nodes = mainEl().querySelectorAll('h1,h2,h3,h4,h5,h6,p,li,dt,dd,caption,th,td,summary,figcaption,blockquote');
    return Array.prototype.filter.call(nodes, function (n) {
      if (ui && ui.wrap.contains(n)) return false;
      if (n.closest('[aria-hidden="true"]')) return false;
      var li = n.closest('li'); if (li && li !== n && n.tagName !== 'LI') return false;
      return n.innerText && n.innerText.trim().length > 0;
    });
  }
  function mark(n) {
    if (speech.current) speech.current.classList.remove('a11yw-reading');
    speech.current = n;
    if (n) { n.classList.add('a11yw-reading'); n.scrollIntoView({ block: 'center', behavior: isOn('motion') ? 'auto' : 'smooth' }); }
  }
  function speakNext() {
    if (!speech.active) return;
    if (speech.i >= speech.items.length) { stopReading(); return; }
    var n = speech.items[speech.i]; mark(n);
    var u = new SpeechSynthesisUtterance(n.innerText.trim());
    u.lang = (n.closest('[lang]') && n.closest('[lang]').getAttribute('lang')) || t.lang; u.rate = 1;
    u.onend = function () { if (speech.active) { speech.i++; speakNext(); } };
    u.onerror = function () { stopReading(); };
    global.speechSynthesis.speak(u);
  }
  function startReading() {
    if (!canSpeak) return;
    global.speechSynthesis.cancel();
    speech.items = readable(); speech.i = 0; speech.active = true;
    ui.readLabel.textContent = t.stop; ui.read.setAttribute('aria-pressed', 'true'); ui.pause.hidden = false; ui.pause.textContent = t.pause;
    speakNext();
  }
  function stopReading() {
    speech.active = false; mark(null);
    if (canSpeak) global.speechSynthesis.cancel();
    if (ui) { ui.readLabel.textContent = t.read; ui.read.setAttribute('aria-pressed', 'false'); ui.pause.hidden = true; }
  }
  function togglePause() {
    if (!speech.active) return;
    if (global.speechSynthesis.paused) { global.speechSynthesis.resume(); ui.pause.textContent = t.pause; }
    else { global.speechSynthesis.pause(); ui.pause.textContent = t.resume; }
  }
  global.addEventListener('pagehide', stopReading);

  /* ------------------------------------------------------------------ panel */
  var api = { __loaded: true };
  function segmented(label, prefix, values, labelFor, setter) {
    var row = el('div', { 'class': 'a11yw-seg', role: 'group', 'aria-label': label }, [el('span', { 'class': 'a11yw-label', text: label })]);
    row.appendChild(el('div', { 'class': 'a11yw-seg-buttons' }, values.map(function (v) {
      var b = el('button', { type: 'button', 'class': 'a11yw-seg-btn', 'aria-pressed': 'false', text: labelFor(v) });
      b.addEventListener('click', function () { setter(v); state.profile = null; save(); apply(); announce(label + ': ' + labelFor(v)); });
      ui.pressed[prefix + ':' + v] = b; return b;
    })));
    return row;
  }
  var TAB_KEY = CFG.key + '-tab';
  function build() {
    if (ui || !document.body) return;
    injectCss();
    ui = { pressed: {}, tabs: {}, panels: {} };
    var toggle = el('button', { type: 'button', 'class': 'a11yw-toggle', 'aria-expanded': 'false', 'aria-controls': 'a11yw-panel', 'aria-label': t.open, title: t.open + (CFG.shortcut ? ' (Alt+Shift+A)' : ''), html: ICON });
    var title = el('h2', { id: 'a11yw-title', 'class': 'a11yw-title', tabindex: '-1', text: t.title });
    var close = el('button', { type: 'button', 'class': 'a11yw-close', 'aria-label': t.close, text: '×' });
    var live = el('div', { 'class': 'a11yw-sr', 'aria-live': 'polite', 'aria-atomic': 'true' });
    function icon(name) { return el('span', { 'class': 'a11yw-ico', html: I[name] }); }

    // --- Profiles tab
    var profilesPanel = el('div', { 'class': 'a11yw-profiles' }, Object.keys(PROFILES).map(function (p) {
      var b = el('button', { type: 'button', 'class': 'a11yw-profile', 'aria-pressed': 'false' }, [
        icon(p),
        el('span', { 'class': 'a11yw-profile-text' }, [el('strong', { text: t[p] }), el('small', { text: t[p + 'Desc'] })]),
        el('span', { 'class': 'a11yw-profile-check', html: I.check })
      ]);
      b.addEventListener('click', function () {
        var side = state.side;
        if (state.profile === p) { state = defaults(); state.side = side; announce(t[p] + ' ' + t.profileOff); }
        else { var pr = PROFILES[p]; state = { size: pr.size, spacing: pr.spacing, contrast: pr.contrast, sat: pr.sat, align: pr.align, on: pr.on.slice(), side: side, profile: p }; announce(t[p] + ' ' + t.profileOn); }
        save(); apply();
      });
      ui.pressed['profile:' + p] = b; return b;
    }));

    // --- Text tab
    var smaller = el('button', { type: 'button', 'class': 'a11yw-step', id: 'a11yw-smaller', 'aria-label': t.smaller, text: 'A−' });
    var larger = el('button', { type: 'button', 'class': 'a11yw-step', id: 'a11yw-larger', 'aria-label': t.larger, text: 'A+' });
    var output = el('output', { 'class': 'a11yw-output', 'aria-live': 'polite', 'for': 'a11yw-smaller a11yw-larger', text: state.size + '%' });
    function step(d) { var i = Math.min(SIZES.length - 1, Math.max(0, SIZES.indexOf(state.size) + d)); state.size = SIZES[i]; state.profile = null; save(); apply(); }
    smaller.addEventListener('click', function () { step(-1); });
    larger.addEventListener('click', function () { step(1); });
    function toggleRow(k, label, iconName) {
      var b = el('button', { type: 'button', 'class': 'a11yw-option', 'aria-pressed': 'false' }, [icon(iconName), el('span', { text: label })]);
      b.addEventListener('click', function () {
        state.on = isOn(k) ? state.on.filter(function (x) { return x !== k; }) : state.on.concat(k);
        state.profile = null; save(); apply(); announce(label + ' ' + (isOn(k) ? t.on : t.off));
      });
      ui.pressed['toggle:' + k] = b; return b;
    }
    var textPanel = el('div', {}, [
      el('div', { 'class': 'a11yw-row', role: 'group', 'aria-label': t.textSize }, [el('span', { 'class': 'a11yw-label', text: t.textSize }), smaller, output, larger]),
      segmented(t.spacing, 'spacing', SPACING, function (v) { return t['spacing' + v]; }, function (v) { state.spacing = v; }),
      segmented(t.align, 'align', ALIGN, function (v) { return t['align' + v]; }, function (v) { state.align = v; }),
      toggleRow('font', t.font, 'font')
    ]);

    // --- Color tab
    var colorPanel = el('div', {}, [
      segmented(t.contrast, 'contrast', CONTRAST, function (v) { return t['contrast' + v]; }, function (v) { state.contrast = v; }),
      segmented(t.saturation, 'sat', SAT, function (v) { return t['sat' + v]; }, function (v) { state.sat = v; })
    ]);

    // --- Reading tab (tiles)
    var READING = [['links', t.links, 'links'], ['headings', t.headings, 'headings'], ['focus', t.focusRing, 'focusRing'], ['cursor', t.cursor, 'cursor'], ['guide', t.guide, 'guide'], ['mask', t.mask, 'mask'], ['motion', t.motion, 'motion'], ['images', t.images, 'images'], ['mute', t.mute, 'mute']];
    var readingPanel = el('div', { 'class': 'a11yw-tiles' }, READING.map(function (r) {
      var b = el('button', { type: 'button', 'class': 'a11yw-tile', 'aria-pressed': 'false' }, [icon(r[2]), el('span', { 'class': 'a11yw-tile-label', text: r[1] })]);
      b.addEventListener('click', function () {
        state.on = isOn(r[0]) ? state.on.filter(function (x) { return x !== r[0]; }) : state.on.concat(r[0]);
        state.profile = null; save(); apply(); announce(r[1] + ' ' + (isOn(r[0]) ? t.on : t.off));
      });
      ui.pressed['toggle:' + r[0]] = b; return b;
    }));

    // --- Tools tab
    var readLabel = el('span', { text: t.read });
    var read = el('button', { type: 'button', 'class': 'a11yw-option a11yw-tool', 'aria-pressed': 'false' }, [icon('read'), readLabel]);
    var pause = el('button', { type: 'button', 'class': 'a11yw-option a11yw-tool', text: t.pause, hidden: '' });
    if (canSpeak) { read.addEventListener('click', function () { speech.active ? stopReading() : startReading(); }); pause.addEventListener('click', togglePause); }
    else { read.disabled = true; read.setAttribute('aria-disabled', 'true'); }
    var structureBtn = el('button', { type: 'button', 'class': 'a11yw-option a11yw-tool', 'aria-expanded': 'false', 'aria-controls': 'a11yw-structure' }, [icon('structure'), el('span', { text: t.structure })]);
    var side = el('button', { type: 'button', 'class': 'a11yw-reset', text: t.moveLeft });
    var hide = el('button', { type: 'button', 'class': 'a11yw-reset', text: t.hide });
    var toolsPanel = el('div', { 'class': 'a11yw-toggles' }, [read, pause, canSpeak ? null : el('p', { 'class': 'a11yw-note', text: t.readUnsupported }), structureBtn,
      el('div', { 'class': 'a11yw-foot-row', style: '' }, [side, hide]),
      CFG.shortcut ? el('p', { 'class': 'a11yw-note', text: t.shortcut }) : null]);

    // --- Tabs
    var TABS = [['profiles', t.tabProfiles, profilesPanel], ['text', t.tabText, textPanel], ['color', t.tabColor, colorPanel], ['reading', t.tabReading, readingPanel], ['tools', t.tabTools, toolsPanel]];
    var tablist = el('div', { 'class': 'a11yw-tabs', role: 'tablist', 'aria-label': t.tabsLabel });
    var panels = el('div', { 'class': 'a11yw-tabpanels' });
    var current = 'profiles';
    try { if (sessionStorage.getItem(TAB_KEY)) current = sessionStorage.getItem(TAB_KEY); } catch (x) {}
    if (!TABS.some(function (tb) { return tb[0] === current; })) current = 'profiles';
    function selectTab(id, focusTab) {
      current = id;
      TABS.forEach(function (tb) {
        var on = tb[0] === id;
        ui.tabs[tb[0]].setAttribute('aria-selected', on ? 'true' : 'false');
        ui.tabs[tb[0]].setAttribute('tabindex', on ? '0' : '-1');
        ui.panels[tb[0]].hidden = !on;
      });
      try { sessionStorage.setItem(TAB_KEY, id); } catch (x) {}
      if (focusTab) ui.tabs[id].focus();
    }
    TABS.forEach(function (tb, i) {
      var tab = el('button', { type: 'button', 'class': 'a11yw-tab', role: 'tab', id: 'a11yw-tab-' + tb[0], 'aria-selected': 'false', 'aria-controls': 'a11yw-pane-' + tb[0], tabindex: '-1', text: tb[1] });
      var pane = el('div', { 'class': 'a11yw-tabpanel', role: 'tabpanel', id: 'a11yw-pane-' + tb[0], 'aria-labelledby': 'a11yw-tab-' + tb[0], tabindex: '0', hidden: '' }, [tb[2]]);
      tab.addEventListener('click', function () { selectTab(tb[0], false); });
      tab.addEventListener('keydown', function (e) {
        var n = i;
        if (e.key === 'ArrowRight') n = (i + 1) % TABS.length; else if (e.key === 'ArrowLeft') n = (i - 1 + TABS.length) % TABS.length;
        else if (e.key === 'Home') n = 0; else if (e.key === 'End') n = TABS.length - 1; else return;
        e.preventDefault(); selectTab(TABS[n][0], true);
      });
      ui.tabs[tb[0]] = tab; ui.panels[tb[0]] = pane; tablist.appendChild(tab); panels.appendChild(pane);
    });

    // --- Structure view (replaces tabs while open)
    var structure = el('div', { id: 'a11yw-structure', 'class': 'a11yw-structure', hidden: '' });
    var backBtn = el('button', { type: 'button', 'class': 'a11yw-reset', text: t.back });
    function jump(target) { shut(false); target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); target.scrollIntoView({ block: 'start', behavior: isOn('motion') ? 'auto' : 'smooth' }); }
    function buildStructure() {
      structure.innerHTML = '';
      var hs = Array.prototype.filter.call(mainEl().querySelectorAll('h1,h2,h3,h4,h5,h6'), function (h) { return !ui.wrap.contains(h) && h.innerText.trim() && h.offsetParent !== null; });
      structure.appendChild(el('h3', { 'class': 'a11yw-group-title', text: t.headingsList }));
      if (!hs.length) structure.appendChild(el('p', { 'class': 'a11yw-note', text: t.noHeadings }));
      else structure.appendChild(el('ul', { 'class': 'a11yw-list' }, hs.map(function (h) {
        var b = el('button', { type: 'button', 'class': 'a11yw-link a11yw-h' + h.tagName.charAt(1), text: h.innerText.trim() });
        b.addEventListener('click', function () { jump(h); }); return el('li', {}, [b]);
      })));
      var lms = [['header,[role=banner]', t.lmHeader], ['nav,[role=navigation]', t.lmNav], [CFG.main, t.lmMain], ['aside,[role=complementary]', t.lmAside], ['[role=search]', t.lmSearch], ['footer,[role=contentinfo]', t.lmFooter]];
      var items = lms.map(function (pair) {
        var target = document.querySelector(pair[0]); if (!target || ui.wrap.contains(target)) return null;
        var b = el('button', { type: 'button', 'class': 'a11yw-link', text: pair[1] });
        b.addEventListener('click', function () { jump(target); }); return el('li', {}, [b]);
      }).filter(Boolean);
      structure.appendChild(el('h3', { 'class': 'a11yw-group-title', text: t.landmarks }));
      structure.appendChild(el('ul', { 'class': 'a11yw-list' }, items));
      structure.appendChild(backBtn);
    }
    var options = el('div', { 'class': 'a11yw-options' }, [tablist, panels]);
    structureBtn.addEventListener('click', function () { buildStructure(); options.hidden = true; structure.hidden = false; structureBtn.setAttribute('aria-expanded', 'true'); var f = structure.querySelector('button'); if (f) f.focus(); });
    backBtn.addEventListener('click', function () { structure.hidden = true; options.hidden = false; structureBtn.setAttribute('aria-expanded', 'false'); structureBtn.focus(); });

    // --- Footer
    var reset = el('button', { type: 'button', 'class': 'a11yw-reset', text: t.reset });
    var footRow = el('div', { 'class': 'a11yw-foot-row' }, [reset, CFG.statement ? el('a', { 'class': 'a11yw-statement', href: CFG.statement, text: t.statement }) : null]);
    var panel = el('div', { id: 'a11yw-panel', 'class': 'a11yw-panel', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'a11yw-title', hidden: '' }, [
      el('div', { 'class': 'a11yw-head' }, [title, close]), options, structure, el('div', { 'class': 'a11yw-foot' }, [footRow])
    ]);
    var wrap = el('div', { 'class': 'a11yw', 'data-a11y-widget': '' }, [toggle, panel, live]);
    wrap.style.setProperty('--a11yw-primary', CFG.color);
    wrap.style.setProperty('--a11yw-z', CFG.z);
    document.body.appendChild(wrap);
    ui.wrap = wrap; ui.toggle = toggle; ui.panel = panel; ui.title = title; ui.smaller = smaller; ui.larger = larger; ui.output = output;
    ui.live = live; ui.read = read; ui.readLabel = readLabel; ui.pause = pause; ui.side = side;
    makeOverlays();
    selectTab(current, false);

    function open() { wrap.hidden = false; panel.hidden = false; toggle.setAttribute('aria-expanded', 'true'); title.focus(); }
    function shut(refocus) { panel.hidden = true; toggle.setAttribute('aria-expanded', 'false'); if (refocus) toggle.focus(); }
    function unhide() { wrap.hidden = false; try { sessionStorage.removeItem(HIDE_KEY); } catch (x) {} }
    toggle.addEventListener('click', function () { panel.hidden ? open() : shut(true); });
    close.addEventListener('click', function () { shut(true); });
    document.addEventListener('click', function (e) { if (!panel.hidden && !wrap.contains(e.target)) shut(false); });
    function onKey(e) {
      if (CFG.shortcut && e.altKey && e.shiftKey && (e.key === 'A' || e.key === 'a' || e.code === 'KeyA')) { e.preventDefault(); unhide(); panel.hidden ? open() : shut(true); return; }
      if (panel.hidden) return;
      if (e.key === 'Escape') { shut(true); return; }
      if (e.key === 'Tab') {
        var f = Array.prototype.filter.call(panel.querySelectorAll('button,a,[tabindex="0"],[tabindex="-1"]'), function (n) { return !n.disabled && !n.hidden && n.offsetParent !== null && n.getAttribute('tabindex') !== '-1'; });
        f.unshift(title);
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener('keydown', onKey);
    reset.addEventListener('click', function () { var s2 = state.side; state = defaults(); state.side = s2; stopReading(); save(); apply(); announce(t.reset); title.focus(); });
    side.addEventListener('click', function () { state.side = state.side === 'left' ? 'right' : 'left'; save(); apply(); });
    hide.addEventListener('click', function () { try { sessionStorage.setItem(HIDE_KEY, '1'); } catch (x) {} shut(false); wrap.hidden = true; announce(t.hideNote); });
    function checkHash() { if (location.hash === '#a11y' || location.hash === '#accessibility-panel') { unhide(); open(); } }
    global.addEventListener('hashchange', checkHash);
    try { if (sessionStorage.getItem(HIDE_KEY) === '1') wrap.hidden = true; } catch (x) {}
    checkHash();
    apply();

    api.open = function (tab) { unhide(); open(); if (tab && ui.tabs[tab]) selectTab(tab, false); };
    api.close = function () { shut(false); };
    api.toggle = function () { panel.hidden ? api.open() : shut(true); };
    api.reset = function () { reset.click(); };
    api.get = function () { return JSON.parse(JSON.stringify(state)); };
    api.set = function (partial) { Object.keys(partial || {}).forEach(function (k) { if (k in state) state[k] = partial[k]; }); save(); state = load(); apply(); };
    api.destroy = function () {
      stopReading(); document.removeEventListener('keydown', onKey);
      wrap.remove(); overlays.els.forEach(function (n) { n.remove(); });
      var st = document.getElementById('a11yw-style'); if (st) st.remove();
      root.className = root.className.split(/\s+/).filter(function (c) { return c.indexOf(P + '-') !== 0; }).join(' ');
      ui = null; overlays = null; api.__loaded = false;
    };
  }
  global.A11yWidget = api;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})(window);

js = ["extension-apis.js",
"lib/js/jquery-3.3.1.min.js",
"lib/js/contextmenu.js",
"lib/js/iziToast.min.js",
"lib/js/purify.min.js",
"lib/js/findAndReplaceDOMText.js",
"lib/js/pdf.js",
"lib/js/jquery-3.3.1.min.js",
"lib/js/jquery-migrate-3.0.1.js",
"lib/js/jquery.tipsy.js",
"js/loader.js",
"js/icons.js",
"js/default-themes.js",
"js/theme.js",
"js/preload.js",
"js/version-specific.js",
"js/all.js",
"js/grades.js",
"js/course.js",
"js/materials.js",
"js/home.js",
"js/api-key.js",
"js/user.js",
"js/assessment.js",
"js/page.js",
"js/courses.js",
"js/all-idle.js"]
css = ["lib/css/contextmenu.css",
"lib/css/iziToast.min.css",
"css/all.css"]

jsout = open("allJs.js", "w")
cssout = open("allCss.css", "w")

for jsloc in js:
    jsfile = open(jsloc, "r")
    contents = jsfile.read()
    jsout.write(contents)
    jsout.write("\n")
    jsfile.close()
    
for cssLoc in css:
    cssFile = open(cssLoc, "r")
    contents = cssFile.read()
    cssout.write(contents)
    cssout.write("\n")
    cssFile.close()


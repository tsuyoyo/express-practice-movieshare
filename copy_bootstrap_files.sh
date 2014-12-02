#/bin/bash
########################################################
# Run this script after installing bootstrap by bower.
# It puts each files into public folder.
########################################################

# Bootstrap (css)
distBootstrapCss=public/stylesheets/bootstrap/css
mkdir -p $distBootstrapCss
cp bower_components/bootstrap/dist/css/bootstrap-theme.min.css $distBootstrapCss
cp bower_components/bootstrap/dist/css/bootstrap-theme.css.map $distBootstrapCss
cp bower_components/bootstrap/dist/css/bootstrap.min.css $distBootstrapCss
cp bower_components/bootstrap/dist/css/bootstrap.css.map $distBootstrapCss

# Bootstrap (JavaScript)
distBootstrapJs=public/js/lib/bootstrap
mkdir -p $distBootstrapJs
cp bower_components/bootstrap/dist/js/bootstrap.min.js $distBootstrapJs

# JQuery
distJQuery=public/js/lib/jquery
mkdir -p $distJQuery
cp bower_components/jquery/dist/jquery.min.js $distJQuery
cp bower_components/jquery/dist/jquery.min.map $distJQuery


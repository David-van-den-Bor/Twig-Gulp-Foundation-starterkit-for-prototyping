# twig-prototyping

A simple boilerplate/starterkit for prototyping with TWIG and Foundation.

## Overview

This project leverages Twig (http://twig.sensiolabs.org/) to render the templates, and Foundation 6 (http://foundation.zurb.com/sites.html/) to give things a stylish and responsive feel.

## Bower and Gulp baked in
There's a simple gulp file included which takes care of running preprocessing tasks while working on a design. Browsersync and SASS compiling included. JS files are minified and concatinaded, and images compressed.

## Basic Usage

Preview pages by appending the URL with the page name (ie. '/twig-prototyping/blog' will load up the 'blog.twig' page).

## Creating Views

To add views to your projet, simply create a new .twig file in the appropriate /views/ sub-folder. It will then be available for inclusion. If you wish to provide data for a .twig view, simply create an accompanying .json file in the same directory.

## Feeding Data

If you provide a page (.twig) file with an accompanying data (.json) file (ie. 'blog.json' to accompany 'blog.twig') that JSON data will be read and sent to Twig as display data. 

To print data from your JSON file to your Twig views, put a {{ token.like.this }} in your twig view where the dot-notation describes the location in the data array (ie. $arrData['token']['like']['this'])

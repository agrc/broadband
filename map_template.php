<?php
/*
Template Name: Map_Template
*/
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>Utah Broadband Map</title>
    
    <meta name='keywords' content='utah broadband map, utah broadband'>
    <meta name='description' content='Utah Broadband Interactive Map'>
    
    <link rel='shortcut icon' type='image/png' href='images/favicon.png'>
    
    <!-- CSS FILES -->
    <link rel="stylesheet" type="text/css" href="http://mapserv.utah.gov/broadband/app/resources/App.css">
    <link rel="stylesheet" href="http://fonts.googleapis.com/css?family=Open+Sans:400,300,600">
    
</head>
<body class="claro">
    <div data-dojo-type="app/App"></div>
    
    <!-- JAVASCRIPT FILES -->
    <script data-dojo-config='deps: ["app/run"]' src='http://mapserv.utah.gov/broadband/dojo/dojo.js'></script>
    
    <!-- GOOGLE ANALYTICS -->
    <script type="text/javascript">
        var _gaq = _gaq || [];
        _gaq.push(['_setAccount', 'UA-11849964-30']);
        _gaq.push(['_trackPageview']);

        (function() {
            var ga = document.createElement('script');
            ga.type = 'text/javascript';
            ga.async = true;
            ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
            var s = document.getElementsByTagName('script')[0];
            s.parentNode.insertBefore(ga, s);
        })();
    </script>
</body>
</html>

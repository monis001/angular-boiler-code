Angular module structure
========================
(**NOTE** : *It contains structure for app and some bolier code, you can modify according to your need. It does not contain any build or development environment.*)

### Development
Though build and development environment are not setup  yet, you can use any static server to run the code.

### How to run
1. Get the code first ;)
2. On root folder run `bower install` (you should have installed bower as a global in your system. install from here [Bower](https://bower.io/). Once the dependencies are installed will be available inside `src/vendors` )
3. When all dependencies get installed run `python -m SimpleHTTPServer[PORT]` or any other server.

*voila*

1. **Tip** : *whenever you bower install, use `--save -dev`, e.g.: `bower install angular --save -dev ` it will save your dependencies and help in future too.*
2. *Build or Dev environment by NPM  not supported yet*.
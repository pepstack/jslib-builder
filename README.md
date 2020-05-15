# jslib-builder

A set of tool for developing and building javascript library.

## Environment Requirement

- Windows

- Firefox

- cygwin64


## Build Prerequisities

- jdk-8u162-windows-x64.zip

- node-v12.16.3-x64.msi

- apache-ant-1.9.15-bin.zip


## How to build

### Build all projects

    cd jslib-builder/

    make

    make update

### Build a specified project

    $ cd jslib-builder/

    $ cd jslib

    $ make lint

### Create a your project

In my case the name of project is ecs (Entity, Component and System), refer to:
    
    [What is an Entity Component System architecture for game development?](https://www.richardlord.net/blog/ecs/what-is-an-entity-framework.html)


    $ cd jslib-builder/

    $ cp -r jslib ecs

    After copying, mainly edit below 3 files in your project (jslib-builder/ecs/):
    
    - Makefile          'MODULE_NAME = ecs'
    
    - build.xml         '<property name="project.name" value="ecs" />'
    
    - jslint-check.js   'js_files = [... "./src/plugins/ecs.js"]'
    

    Add ${PREFIX}/ecs to SUBDIRS in jslib-builder/Makefile as below:
    
        SUBDIRS =  ${PREFIX}/jslib ${PREFIX}/ecs
    

    Run make to build all projects in jslib-builder/

    $ make



    

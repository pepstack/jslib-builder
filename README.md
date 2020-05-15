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

Find SUBDIRS in 'jslib-builder/Makefile' and change it as below:
    
    SUBDIRS =  ${PREFIX}/jslib ${PREFIX}/ecs
    
    $ cd ecs/
    
Find MODULE_NAME in 'jslib-builder/ecs/Makefile' and change it as the following:
    
    MODULE_NAME = ecs

    $ make



    

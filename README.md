<p align="center"><img src="/client/assets/logo_apiroot.png" width="400"></img></p>

# APIRoot &nbsp;<img src="https://img.shields.io/badge/build-passing-brightgreen.svg" alt="Build Status"></img> <img src="https://img.shields.io/badge/license-GPL%20v3-blue.svg" alt="License"></img>

APIRoot es un gestor simple y efectivo que sirve para poder gestionar y ejecutar servicios web desde una aplicación móvil multiplataforma. 
El sistema se ha implementado realizando primero los estudios previos de mercado y teniendo en cuenta siempre unos requisitos inicialmente establecidos de usabilidad, seguridad, rendimiento y fiabilidad del sistema. Dispone de una interfaz gráfica usable, simple y eficiente.

## Características implementadas


*	Cliente móvil multiplataforma

Se ha desarrollado utilizando React Native con Expo, se utiliza para acceder a las colecciones, que son la forma de agrupar por carpetas los servicios web, y también para ejecutar dichos servicios web introduciendo los parámetros que le sean solicitados en el caso de que los haya. El cliente móvil se comunica con la base de datos MySQL mediante la API Rest.

*	Página web de configuración

Implementada usando ReactJS, sirve para crear, configurar y eliminar tanto las colecciones como los servicios web del usuario. Se comunica con la base de datos MySQL a través de la API Rest.

*	Servidor

Sistema operativo Ubuntu 18.04, servidor web NGINX, y certificados SSL de Let’s Encrypt. La API Rest se ha implementado utilizando un servidor NodeJS. 

## Autoría

* **Lawrence Rider García** - *Programador* - [Larry](https://tfg.larryrider.es)


## Licencia

Este proyecto está bajo la licencia GNU GPL v3 - revisa [LICENSE](LICENSE) para ver más detalles.

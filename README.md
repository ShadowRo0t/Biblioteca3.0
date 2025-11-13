# Desarrollo web y movil
caso 16  Sistema de Préstamo en Biblioteca Municipal 

Grupo 1 
Cristobal Galaz 
Juan Rojas
Walter Chavez
Felipe Arancibia
Franco Labarca

# INSTALACION

Antes de comenzar asegúrate de tener instalado:
1) Node.js https://nodejs.org/es
2) MySQL https://dev.mysql.com/downloads/installer
3) Virtual Box https://www.virtualbox.org
4) GitBash https://git-scm.com/downloads
5) Gestor de bases de datos como HeidiSQL - mysql workbench etc 
6) Angular CLI (en la consola del gitbash o powershell de la carpeta del proyecto)
7) Vagrant https://developer.hashicorp.com/vagrant/install
8) Tener correctamente instalado la carpeta Homestead (Guia 10 Instalación Laravel - Backend )
9) Tener MongoDB instalado
10) Tener MongoDB Compass instalado, para ver la base de datos
11) Tener Flutter y android studio correctamente isntalado

# Pasos para correr Laravel
###  Instalación
1) cd code/primerproyectolaravel 

2) configurar DB_DATABASE, DB_USERNAME, DB_PASSWORD en .env (en mi caso utilice la DB llamada biblioteca <img width="786" height="333" alt="image" src="https://github.com/user-attachments/assets/6f4bb5ea-b7c3-4d3f-ae05-ff2930511620" />
3) composer install (esto instala las dependencias de laravel definidas en el composer.json)
4) php artisan migrate --seed (Crear las tablas e insertar datos iniciales)


# Pasos para correr Angular
###  Instalación
1) cd Biblioteca-main
2) npm install -g @Angular/cli
3) npm install
4) ng serve

#Pasos para correr el Back
1) cd desarrollo-web-main\Biblioteca-main\Backend
2) npm run seed -> (Cargar los datos a la base de datos)
3) npm run dev -> (Ejecuta el back)\n
------en otra terminal---------
4) cd desarrollo-web-main\Biblioteca-main
5) ng serve

#Pasos para correr en movil
1) Tener el Back ejecutandose
2) Abrir android studio y ejecutar un celular virtual
3) flutter devices y buscar el emulador del celular
4) flutter run -d emulador ----  -> Reemplazar ---- por los numeros del emulador

# Plataforma de Gestión de Gimnasio 🏋️‍♂️

Una aplicación web moderna y profesional diseñada para optimizar la administración de gimnasios y mejorar la experiencia de los clientes. Construida con **Next.js**, **Tailwind CSS** y **Firebase**.

## 🚀 Características Principales

### Para Clientes

- **Panel de Control Personalizado**: Resumen de actividad, plan actual y estado de suscripción.
- **Calendario Interactivo**: Visualización de fechas de pago, eventos especiales y cierres del gimnasio con detalles al hacer clic.
- **Gestión de Membresías**: Selección entre niveles Básico, Pro y Elite con actualización automática de rutinas.
- **Pasarela de Pagos**: Soporte para tarjetas y Pago Móvil con tasa BCV automatizada.
- **Rutinas y Dietas**: Acceso directo a programas de entrenamiento y planes nutricionales según el nivel de membresía.

### Para Administradores

- **Monitor de Transacciones**: Vista en tiempo real de pagos realizados y pendientes de verificación.
- **Buzón de Notificaciones**: Sistema de aprobación/rechazo de pagos manuales (Pago Móvil).
- **Control de Suscripciones**: Botones para extender (+1 mes) o ajustar (-1 mes) el tiempo de los usuarios con lógica de apilamiento inteligente.
- **Editor Maestro de Planes**: Gestión completa de rutinas de ejercicios (series, repeticiones, descansos) y planes de alimentación por cada membresía.
- **Gestión del Calendario**: Interfaz horizontal para programar eventos, feriados o cierres parciales.
- **Tasa BCV del Día**: Visualización automática de la tasa oficial en tiempo real.

## 🛠️ Tecnologías Utilizadas

- **Frontend**: [Next.js 14](https://nextjs.org/) (App Router), React, Tailwind CSS.
- **Backend / Database**: [Firebase](https://firebase.google.com/) (Firestore, Auth).
- **Fechas**: [date-fns](https://date-fns.org/).
- **Calendario**: [react-day-picker](https://react-day-picker.js.org/).
- **Iconos**: [Heroicons](https://heroicons.com/).

## ⚙️ Configuración del Proyecto

### Requisitos Previos

- Node.js 18.x o superior.
- Una cuenta de Firebase con un proyecto configurado.

### Instalación

1. Clonar el repositorio.
2. Instalar dependencias:
   ```bash
   npm install
   ```

## 📄 Licencia

Este proyecto es privado y confidencial. Todos los derechos reservados.

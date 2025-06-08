#Aquí va la documentación del proyecto

ESTRUCTURA DEL PROYECTO:
proyecto-sushi-burrito/
├── public/                  # Archivos públicos (assets)
│   ├── images/              # Todas las imágenes del proyecto
│   ├── fonts/               # Fuentes tipográficas
│   └── favicon.ico          # Favicon del sitio
│
├── src/                     # Código fuente principal
│   ├── assets/              # Assets compilados/manipulados
│   │   └── scss/            # SCSS compilado a CSS
│   │
│   ├── controllers/         # Lógica de la aplicación (JS)
│   │   ├── auth/            # Controladores de autenticación
│   │   │   ├── login.controller.js
│   │   │   ├── logout.controller.js
│   │   │   ├── forgot-password.controller.js
│   │   │   └── reset-password.controller.js
│   │   │
│   │   ├── admin/           # Controladores de administración
│   │   │   ├── users.controller.js
│   │   │   ├── menu.controller.js
│   │   │   └── stats.controller.js
│   │   │
│   │   ├── kitchen/         # Controladores de cocina
│   │   │   └── orders.controller.js
│   │   │
│   │   ├── waiter/          # Controladores de mesero
│   │   │   └── tables.controller.js
│   │   │
│   │   └── shared/          # Controladores compartidos
│   │       ├── api.service.js  # Servicio API
│   │       ├── auth.service.js # Servicio autenticación
│   │       └── utils.js        # Utilidades comunes
│   │
│   ├── models/              # Modelos de datos
│   │   ├── user.model.js
│   │   ├── menu.model.js
│   │   ├── order.model.js
│   │   └── table.model.js
│   │
│   ├── styles/              # Estilos (SCSS modular)
│   │   ├── base/            # Estilos base
│   │   │   ├── _reset.scss      # Reset/normalize
│   │   │   ├── _typography.scss # Tipografía
│   │   │   ├── _variables.scss  # Variables CSS
│   │   │   └── _mixins.scss     # Mixins SCSS
│   │   │
│   │   ├── components/      # Componentes reutilizables
│   │   │   ├── _buttons.scss
│   │   │   ├── _forms.scss
│   │   │   ├── _tables.scss
│   │   │   ├── _modals.scss
│   │   │   └── _cards.scss
│   │   │
│   │   ├── layouts/         # Diseños estructurales
│   │   │   ├── _header.scss
│   │   │   ├── _footer.scss
│   │   │   ├── _sidebar.scss
│   │   │   └── _grid.scss
│   │   │
│   │   ├── pages/          # Estilos específicos de páginas
│   │   │   ├── _auth.scss      # Estilos para login, forgot-password, etc.
│   │   │   ├── _admin.scss     # Estilos para panel admin
│   │   │   ├── _kitchen.scss   # Estilos para cocina
│   │   │   └── _waiter.scss    # Estilos para mesero
│   │   │
│   │   ├── themes/         # Temas (opcional)
│   │   │   └── _default.scss
│   │   │
│   │   └── main.scss       # Archivo principal que importa todos los demás
│   │
│   └── views/              # Vistas (HTML)
│       ├── auth/           # Vistas de autenticación
│       │   ├── login.html
│       │   ├── forgot-password.html
│       │   └── reset-password.html
│       │
│       ├── admin/          # Vistas de administrador
│       │   ├── dashboard.html
│       │   ├── users/
│       │   │   └── management.html
│       │   ├── menu/
│       │   │   └── management.html
│       │   └── stats/
│       │       └── overview.html
│       │
│       ├── kitchen/        # Vistas de cocina
│       │   └── orders.html
│       │
│       ├── waiter/         # Vistas de mesero
│       │   └── tables.html
│       │
│       └── shared/         # Componentes compartidos
│           ├── header.html
│           ├── footer.html
│           └── navigation.html
│
├── index.html              # Punto de entrada principal
├── .gitignore              # Archivos ignorados por Git
└── README.md               # Documentación del proyecto
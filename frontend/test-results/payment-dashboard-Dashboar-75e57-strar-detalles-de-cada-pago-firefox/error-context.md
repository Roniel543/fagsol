# Page snapshot

```yaml
- generic [ref=e8]:
  - generic [ref=e9]:
    - generic [ref=e10]:
      - img "FagSol Logo" [ref=e12]
      - heading "Iniciar Sesión" [level=2] [ref=e13]
      - paragraph [ref=e14]: FagSol Escuela Virtual
    - generic [ref=e15]:
      - generic [ref=e16]:
        - generic [ref=e18]:
          - generic [ref=e19]: Email*
          - textbox "Email*" [ref=e20]:
            - /placeholder: tu@email.com
        - generic [ref=e22]:
          - generic [ref=e23]: Contraseña*
          - textbox "Contraseña*" [ref=e24]:
            - /placeholder: Tu contraseña
      - button "Iniciar Sesión" [ref=e25] [cursor=pointer]
      - paragraph [ref=e27]:
        - text: ¿No tienes cuenta?
        - link "Regístrate aquí" [ref=e28] [cursor=pointer]:
          - /url: /auth/register
  - paragraph [ref=e30]: © 2025 FagSol Escuela Virtual. Todos los derechos reservados.
```
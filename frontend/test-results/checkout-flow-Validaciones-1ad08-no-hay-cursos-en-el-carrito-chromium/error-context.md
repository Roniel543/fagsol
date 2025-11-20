# Page snapshot

```yaml
- generic [active] [ref=e1]:
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
              - text: student@test.com
          - generic [ref=e22]:
            - generic [ref=e23]: Contraseña*
            - textbox "Contraseña*" [ref=e24]:
              - /placeholder: Tu contraseña
              - text: testpass123
        - generic [ref=e25]: Credenciales inválidas
        - button "Iniciar Sesión" [ref=e26] [cursor=pointer]
        - paragraph [ref=e28]:
          - text: ¿No tienes cuenta?
          - link "Regístrate aquí" [ref=e29] [cursor=pointer]:
            - /url: /auth/register
    - paragraph [ref=e31]: © 2025 FagSol Escuela Virtual. Todos los derechos reservados.
  - alert [ref=e32]
```
# Mapa de tablas — PMVM / R3SET

## ✅ Tablas activas (Web + Mobile en sync)

| Tabla | Descripción |
|---|---|
| `profiles` | **Fuente de verdad de usuarios.** Rol, nombre, teléfono, trainer, onboarding, locale, sex |
| `exercises` | Ejercicios seeded desde AscendAPI/RapidAPI |
| `routines` | Plantillas de rutinas creadas por el admin |
| `routine_exercises` | Ejercicios dentro de cada rutina |
| `routine_assignments` | Rutinas asignadas a clientes con fechas y días |
| `subscriptions` | Suscripciones de clientes (MercadoPago) |
| `plans` | Planes disponibles con precios |
| `daily_goals` | Objetivos diarios del cliente |
| `goal_templates` | Plantillas de objetivos reutilizables |
| `goal_assignments` | Objetivos asignados por el trainer |
| `hydration_logs` | Registro de hidratación diaria |
| `meal_logs` | Registro de comidas |
| `body_measurements` | Mediciones corporales |
| `progress_photos` | Fotos de progreso |
| `push_tokens` | Tokens para notificaciones push |

## 🔄 Vistas (Views)

| Vista | Descripción |
|---|---|
| `user_profiles` | VIEW de `profiles` para compatibilidad con mobile |
| `v_goal_assignments_admin` | Vista admin de asignaciones de objetivos |
| `v_routine_assignments_admin` | Vista admin de asignaciones de rutinas |

## ⚠️ Tablas solo mobile (sistema paralelo)

Estas tablas las usa la app mobile para su sistema de training plans.
**No tocar** hasta migrar la mobile al sistema de rutinas del web.

| Tabla | Descripción |
|---|---|
| `workouts` | Entrenamientos individuales (sistema mobile) |
| `workout_exercises` | Ejercicios en workouts (sistema mobile) |
| `workout_logs` | Logs de entrenamientos completados |
| `training_phases` | Fases de programa de entrenamiento |
| `training_days` | Días dentro de cada fase |

## 🗑️ Tablas a eliminar (cuando estés listo)

| Tabla | Motivo |
|---|---|
| `messages` | Reemplazado por WhatsApp redirects |

## 📋 Columnas a limpiar en `exercises`

```sql
-- Columnas duplicadas sin uso (safe to drop después de verificar)
ALTER TABLE public.exercises DROP COLUMN IF EXISTS body_parts;
ALTER TABLE public.exercises DROP COLUMN IF EXISTS target_muscles;
ALTER TABLE public.exercises DROP COLUMN IF EXISTS gender;
```

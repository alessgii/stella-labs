// src/pages/api/workshops/register.js
import { registerToWorkshop } from '../../../lib/workshops';
import { supabase } from '../../../lib/supabase';

export const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const { workshopId } = body;

    // Verificar sesión activa
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Debes iniciar sesión para registrarte.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!workshopId) {
      return new Response(
        JSON.stringify({ error: 'Identificador de taller no válido.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Ejecutar lógica del servicio
    const { data, error } = await registerToWorkshop(workshopId, user.id);

    if (error) {
      return new Response(
        JSON.stringify({ error }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || 'Error interno del servidor.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
// src/pages/api/workshops/register.js
import { createClient } from '@supabase/supabase-js';
import { registerToWorkshop } from '../../../lib/workshops';
import { supabase } from '../../../lib/supabase';

// Forzar modo dinámico (SSR)
export const prerender = false;

export const POST = async ({ request, cookies }) => {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : cookies.get('sb-access-token')?.value;

    if (!token) {
      return new Response(JSON.stringify({ error: 'Debes iniciar sesión para registrarte.' }), { status: 401 });
    }

    // Validar token y obtener usuario
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Sesión inválida o expirada.' }), { status: 401 });
    }

    const { workshopId } = await request.json();
    if (!workshopId) {
      return new Response(JSON.stringify({ error: 'Identificador de taller no válido.' }), { status: 400 });
    }


    const authClient = createClient(
      supabase.supabaseUrl, 
      supabase.supabaseKey, 
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    // Pasamos el authClient a nuestra función de servicio
    const { data, error } = await registerToWorkshop(workshopId, user.id, authClient);

    if (error) {
      // Extraemos el texto real del error para evitar el [object Object] en el frontend
      const errorMsg = typeof error === 'string' ? error : (error.message || 'Fallo de permisos en la base de datos.');
      return new Response(JSON.stringify({ error: errorMsg }), { status: 400 });
    }

    return new Response(JSON.stringify({ success: true, data }), { status: 200 });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Error interno' }), { status: 500 });
  }
};
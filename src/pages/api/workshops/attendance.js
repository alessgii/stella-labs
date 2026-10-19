import { supabase } from '../../../lib/supabase';

export const POST = async ({ request }) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
    }

    const { registrationId, attended, sessionDate } = await request.json();
    const date = sessionDate || new Date().toISOString().split('T')[0];

    if (attended) {
      // Marcar / Insertar asistencia
      const { data, error } = await supabase
        .from('workshops_attendances')
        .upsert(
          {
            registration_id: registrationId,
            session_date: date,
            attended: true,
            marked_by: user.id,
            marked_at: new Date().toISOString()
          },
          { onConflict: 'registration_id,session_date' }
        )
        .select()
        .single();

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, data }), { status: 200 });
    } else {
      // Desmarcar / Eliminar registro de asistencia
      const { error } = await supabase
        .from('workshops_attendances')
        .delete()
        .eq('registration_id', registrationId)
        .eq('session_date', date);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Error al actualizar asistencia' }), { status: 500 });
  }
};
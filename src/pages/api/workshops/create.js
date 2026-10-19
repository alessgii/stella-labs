import { supabase } from '../../../lib/supabase';

export const POST = async ({ request }) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
    }

    // Validar con los roles correctos: admin y organizer
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'organizer'].includes(profile.role)) {
      return new Response(JSON.stringify({ error: 'Acceso denegado: Permisos insuficientes' }), { status: 403 });
    }

    const payload = await request.json();

    const { data, error } = await supabase
      .from('workshops')
      .insert([
        {
          title: payload.title,
          slug: payload.slug || payload.title.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
          description: payload.description,
          modality: payload.modality || 'presencial',
          classroom: payload.classroom,
          instructor_id: payload.instructor_id,
          max_capacity: parseInt(payload.max_capacity, 10),
          day_of_week: payload.day_of_week,
          start_time: payload.start_time,
          duration: payload.duration || '2 hours',
          register_starts_at: payload.register_starts_at,
          register_ends_at: payload.register_ends_at,
          status: payload.status || 'proximamente',
          image_url: '/assets/default-workshop.webp'
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, data }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Error interno al crear el taller' }), { status: 500 });
  }
};
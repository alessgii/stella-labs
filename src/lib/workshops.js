// src/lib/workshops.js
import { supabase } from './supabase';

/**
 * Obtiene la lista de talleres activos u ordenados por fecha, 
 * incluyendo el conteo total de alumnos inscritos en cada uno.
 */
export async function getWorkshops() {
  try {
    const { data, error } = await supabase
      .from('workshops')
      .select(`
        *,
        workshops_registrations (count)
      `)
      .neq('status', 'cancelado')
      .order('register_starts_at', { ascending: true });

    if (error) throw error;

    // Mapeo limpio para exponer el número total de inscritos
    const formattedData = data.map((workshop) => ({
      ...workshop,
      total_registered: workshop.workshops_registrations?.[0]?.count || 0,
    }));

    return { data: formattedData, error: null };
  } catch (error) {
    return { data: null, error: error.message || error };
  }
}

/**
 * Ejecuta la lógica de registro a un taller validando:
 * a) Ventana de fechas de registro
 * b) Disponibilidad de cupo
 * c) Ausencia de registro previo por el mismo usuario
 */
export async function registerToWorkshop(workshopId, userId) {
  try {
    // a) Verificar si el usuario ya está registrado previamente
    const { data: existingReg, error: checkRegError } = await supabase
      .from('workshops_registrations')
      .select('id')
      .eq('workshop_id', workshopId)
      .eq('user_id', userId)
      .maybeSingle();

    if (checkRegError) throw checkRegError;

    if (existingReg) {
      return { data: null, error: 'Ya estás registrado en este taller.' };
    }

    // b) Obtener datos del taller y el conteo de inscritos actuales
    const { data: workshop, error: workshopError } = await supabase
      .from('workshops')
      .select(`
        *,
        workshops_registrations (count)
      `)
      .eq('id', workshopId)
      .single();

    if (workshopError || !workshop) {
      throw workshopError || new Error('El taller especificado no existe.');
    }

    // c) Validar período de registro (fechas)
    const now = new Date();
    const startsAt = new Date(workshop.register_starts_at);
    const endsAt = new Date(workshop.register_ends_at);

    if (now < startsAt) {
      return { data: null, error: 'El período de registro aún no ha iniciado.' };
    }

    if (now > endsAt) {
      return { data: null, error: 'El período de registro para este taller ya ha finalizado.' };
    }

    // d) Validar disponibilidad de cupo
    const currentRegistered = workshop.workshops_registrations?.[0]?.count || 0;
    if (currentRegistered >= workshop.max_capacity) {
      return { data: null, error: 'Cupo agotado. No hay lugares disponibles para este taller.' };
    }

    // e) Realizar la inscripción en workshops_registrations
    const { data: registration, error: insertError } = await supabase
      .from('workshops_registrations')
      .insert([
        {
          workshop_id: workshopId,
          user_id: userId,
        },
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    return { data: registration, error: null };
  } catch (error) {
    return { data: null, error: error.message || error };
  }
}

/**
 * Devuelve las métricas principales para el dashboard administrativo:
 * - Total de usuarios (profiles)
 * - Total de talleres activos
 * - Total de inscripciones realizadas
 */
export async function getAdminDashboardStats() {
  try {
    const [profilesRes, workshopsRes, registrationsRes] = await Promise.all([
      // Total de perfiles
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true }),

      // Total de talleres activos (registro abierto, en curso o próximamente)
      supabase
        .from('workshops')
        .select('*', { count: 'exact', head: true })
        .in('status', ['registro_abierto', 'en_curso', 'proximamente']),

      // Total de inscripciones históricas
      supabase
        .from('workshops_registrations')
        .select('*', { count: 'exact', head: true }),
    ]);

    if (profilesRes.error) throw profilesRes.error;
    if (workshopsRes.error) throw workshopsRes.error;
    if (registrationsRes.error) throw registrationsRes.error;

    return {
      data: {
        totalUsers: profilesRes.count || 0,
        activeWorkshops: workshopsRes.count || 0,
        totalRegistrations: registrationsRes.count || 0,
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error: error.message || error };
  }
}
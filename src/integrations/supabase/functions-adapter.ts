import { supabase } from './client';

type InvokeOptions<T> = { body?: T };

export async function invokeFunction<R = any, B = any>(name: string, options?: InvokeOptions<B>): Promise<{ data: R | null; error: any | null }>{
  try {
    const { data, error } = await supabase.functions.invoke(name, { body: options?.body });
    return { data: (data as R) ?? null, error: error ?? null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

export async function listProgramsJson(limit = 10) {
  return invokeFunction<any>('list-programs-json', { body: { limit } });
}

export async function generateAssignments(body: { programacao_id: string; congregacao_id: string }) {
  return invokeFunction<any>('generate-assignments', { body });
}

export async function saveAssignments(body: {
  programacao_id: string;
  congregacao_id: string;
  itens: Array<{ programacao_item_id: string; principal_estudante_id: string | null; assistente_estudante_id: string | null; observacoes?: string }>
}) {
  return invokeFunction<any>('save-assignments', { body });
}



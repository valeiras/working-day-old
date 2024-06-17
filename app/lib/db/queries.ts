"use server";

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Tables } from "./database.types";
import { createClerkServerSupabaseClient } from "./serverSupabaseClient";
import { PostgrestError, PostgrestBuilder } from "@supabase/postgrest-js";
import { DBError } from "../errors";

export type StartAndPauseTimes = { id: number; startTime: string; pauseTime: string }[] | null;

export type ProjectWithWorkingTimes = {
  name: string;
  id: number;
  activeBlock: {
    id: number;
    times: StartAndPauseTimes;
  } | null;
  workingBlocks: { id: number; workingTimeSeconds: number }[];
};

export type ProjectWithActiveBlock = {
  name: string;
  id: number;
  activeBlock: {
    id: number;
    times: StartAndPauseTimes;
  } | null;
};

export async function authenticateAndRedirect() {
  const { userId } = auth();
  if (!userId) redirect("/");

  return userId;
}

export const insertProject = async ({
  name,
}: {
  name: string;
}): Promise<{ data: Tables<"projects">[] | null; error?: unknown | PostgrestError }> => {
  const client = await createClerkServerSupabaseClient();

  return withErrorHandling(client.from("projects").insert({ name }).select());
};

export const selectAllProjects = async (): Promise<{
  data: Tables<"projects">[] | null;
  error?: PostgrestError | null;
}> => {
  const client = await createClerkServerSupabaseClient();

  return withErrorHandling(client.from("projects").select());
};

export const selectAllProjectsWithWorkingTimes = async (): Promise<{
  data: ProjectWithWorkingTimes[] | null;
  error?: PostgrestError | null;
}> => {
  const client = await createClerkServerSupabaseClient();

  return withErrorHandling(
    client
      .from("projects")
      .select(
        `name, id,
        activeBlock:working_blocks!projects_active_block_id_fkey(id, times:active_block_times(id, startTime:start_time, pauseTime:pause_time, createdAt:created_at)),
        workingBlocks:working_blocks!working_blocks_project_id_fkey(id, workingTimeSeconds:working_time_seconds)`
      )
      .order("name", { ascending: true })
      .order("created_at", { referencedTable: "working_blocks.active_block_times", ascending: false })
      .returns<ProjectWithWorkingTimes[]>()
  );
};

export const updateProject = async ({
  projectId,
  projectData,
}: {
  projectId: number;
  projectData: Partial<Tables<"projects">>;
}): Promise<{
  data: Tables<"projects"> | null;
  error?: PostgrestError | null;
}> => {
  const client = await createClerkServerSupabaseClient();

  return withErrorHandling(client.from("projects").update(projectData).eq("id", projectId).select().maybeSingle());
};

export const selectProjectById = async (
  id: number
): Promise<{ data: ProjectWithActiveBlock | null; error?: PostgrestError | null }> => {
  const client = await createClerkServerSupabaseClient();

  return withErrorHandling(
    client
      .from("projects")
      .select(
        `name, id,
        activeBlock:working_blocks!projects_active_block_id_fkey(
          id, times:active_block_times(id, startTime:start_time, pauseTime:pause_times))`
      )
      .eq("id", id)
      .returns<ProjectWithActiveBlock>()
      .maybeSingle()
  );
};

export const insertBlock = async ({
  projectId,
}: {
  projectId: number;
}): Promise<{ data: Tables<"working_blocks"> | null; error?: unknown | PostgrestError }> => {
  const client = await createClerkServerSupabaseClient();

  return withErrorHandling(
    client
      .from("working_blocks")
      .insert({ project_id: projectId })
      .select()
      .returns<Tables<"working_blocks">>()
      .maybeSingle()
  );
};

export const insertStartTime = async ({
  blockId,
  date,
}: {
  blockId: number;
  date?: Date;
}): Promise<{ data: Tables<"active_block_times"> | null; error?: unknown | PostgrestError }> => {
  const client = await createClerkServerSupabaseClient();

  return withErrorHandling(
    client
      .from("active_block_times")
      .insert({ block_id: blockId, time: date?.toISOString() })
      .select()
      .returns<Tables<"active_block_times">>()
      .maybeSingle()
  );
};

export const insertPauseTime = async ({
  startTimeId,
  date,
}: {
  startTimeId: number;
  date?: Date;
}): Promise<{ data: Tables<"active_block_times"> | null; error?: unknown | PostgrestError }> => {
  const client = await createClerkServerSupabaseClient();

  // If the date is not provided, use the current date
  return withErrorHandling(
    client
      .from("active_block_times")
      .update({ pause_time: date?.toISOString() || new Date().toISOString() })
      .eq("id", startTimeId)
      .select()
      .returns<Tables<"active_block_times">>()
      .maybeSingle()
  );
};

const withErrorHandling = async <T>(
  fn: PostgrestBuilder<T>
): Promise<{ data: T | null; error?: PostgrestError | null }> => {
  let error: PostgrestError | null = null;
  let data: T | null = null;

  try {
    ({ data, error } = await fn);
    if (error) throw new DBError(error.message);
  } catch (e) {
    if (error instanceof DBError) {
      console.error(error.message);
    } else {
      console.error("Something went wrong");
    }
  } finally {
    console.log(data);
    return { data, error };
  }
};

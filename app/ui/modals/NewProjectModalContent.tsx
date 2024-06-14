"use client";

import { createNewProject } from "@/app/lib/actions";
import { SubmitHandler, useForm } from "react-hook-form";
import { newProjectFormSchema, NewProjectFormSchemaType } from "../../lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

const NewProjectModalContent: React.FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewProjectFormSchemaType>({ resolver: zodResolver(newProjectFormSchema), defaultValues: { name: "" } });

  const onSubmit: SubmitHandler<NewProjectFormSchemaType> = async (data) => {
    await createNewProject({ name: data.name });
    reset();
    router.back();
    queryClient.invalidateQueries({ queryKey: ["projects"] });
  };

  const onCancel = () => {
    router.back();
    reset();
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <h3 className="font-bold text-lg">{"Create new project"}</h3>
      <input {...register("name")} type="text" placeholder="Project's name" className="input input-bordered w-full" />
      <span className="text-sm text-error h-1 -mt-2 mb-1">{errors.name ? errors.name.message : ` `}</span>
      <div className="grid grid-cols-2 gap-2">
        <button className="btn btn-primary " type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create"}
        </button>
        <button className="btn btn-secondary" type="reset" onClick={onCancel} disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Cancel"}
        </button>
      </div>
    </form>
  );
};

export default NewProjectModalContent;

import { applications } from "../data/applications";

export const applicationsService = {
  async list() { return applications; },
  async getById(id) { return applications.find(application => application.id === id) ?? null; },
};

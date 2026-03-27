---
to: src/modules/<%= name %>/interfaces/<%= name %>.service.interface.ts
---
export interface I<%= className %>Service {
  findOne(id: string): Promise<unknown>;
}

export type Vehicle = {
  id: string;
  plate: string;
  model: string;
  capacity: number;
  createdAt: string;
  updatedAt: string;
  _count: {
    maintenances: number;
    events: number;
  };
};

export type CreateVehicleInput = {
  plate: string;
  model: string;
  capacity: number;
};

export type UpdateVehicleInput = Partial<CreateVehicleInput>;

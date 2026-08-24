export interface CurrentEmployee {
  id: string;

  role:
    | string
    | {
        name: string;
      };
}
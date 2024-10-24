declare global {

    interface INote {
      id: number;
      note: string;
      color: string;
      pinned: boolean;
      cords: { x: number; y: number };
    }

}

export type INote = INote

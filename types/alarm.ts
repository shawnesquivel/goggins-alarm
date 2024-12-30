export interface Alarm {
  id: string;
  time: Date;
  enabled: boolean;
  label?: string;
  repeat: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
}

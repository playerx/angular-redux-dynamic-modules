
export interface StoreConfig {
	InitialState: any;
	reducer: any;
	epics: any[];
}


export interface StoreConfigs { [key: string]: StoreConfig; }

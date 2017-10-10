# Dynamic modules configuration for Angular Redux

Works with async modules too.

## How to use:

App module:

```ts
import { StoreModule } from 'angular-redux-dynamic-modules';

@NgModule({
	declarations: [
		AppComponent
	],
	imports: [
		...
		StoreModule,
		...
		UserModule,
		HRModule,
	],
	bootstrap: [AppComponent]
})
export class AppModule { }

```



User Module (for example):

```ts
import { StoreConfigService } from 'angular-redux-dynamic-modules';


@NgModule({
	imports: [
		CommonModule,
	],
	providers: [Actions, UserService, Epics],
})
export class UserModule {
	constructor(storeConfig: StoreConfigService) {
		// Register State
		storeConfig.addModule(
			'User', // key for state (root level)
			InitialState,
			reducer,
			[Epics]
		);
	}
}
```

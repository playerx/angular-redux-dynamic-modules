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


Dispatching Actions:

```ts
import { Dispatcher } from 'angular-redux-dynamic-modules';


export class MainComponent implements OnInit {

	constructor(
		private store: Dispatcher<hr.PublicAction | user.PublicAction>
	) { }
	
	ngOnInit() {
		this.store.dispatch({
			type: hr.ActionType.LoadList,
			filterName: '',
			filterSurname: ''
		});
	}

}
```


Also please check out: 
[Example App](https://github.com/altasoft/angular-redux)

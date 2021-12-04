<script lang="ts">
	import 'bulma/css/bulma.css';
	import '@fortawesome/fontawesome-free/js/all'

	import type { Address } from './lib/interfaces/address'
	import { InputMode, ModeFunction } from './lib/InputMode'
	import TextInput from './components/common/TextInput.svelte'
	import InputModes from './components/InputModes.svelte'
	import AddressList from './components/AddressList.svelte'

	let addressInput: string = '';
	let addresses: Address[] = []

	const prepareAddresses = (newAddresses) => newAddresses.map(address => ({...address, active: true}));

	const searchAddress: ModeFunction = async () => {
        if(addressInput === '')
			return addresses.map(address =>  ({...address, active: true}))

        addresses.forEach(address => {
            address.active = address.bechAddress.includes(addressInput) || 
                address.balance === addressInput;
        })
        return [...addresses];
    }

	const addAddress: ModeFunction = async () => {
		const newAddresses = await window.api.UpdateAddressList(addressInput);
		return prepareAddresses(newAddresses);
	}

	const addMode = new InputMode('Add', 'Enter address', true, addAddress)
	const searchMode = new InputMode('Search', 'Search for address or balance', false, searchAddress)

	let inputModes = [addMode, searchMode]
	let activeMode = addMode
	let placeholder = activeMode.GetPlaceholder();
		addressInput = event.target.value;
	}

	function onChangeInputMode (event){
		event.preventDefault;
		inputModes.forEach(mode => {
            if(mode.GetName() === this.name){
				placeholder = mode.GetPlaceholder();
				mode.SetActive(true);
				activeMode = mode;
                return mode
			}

            mode.SetActive(false);
			return mode;
        })
		inputModes = [...inputModes];
    }

	async function onInputKeypress (event) {
		if(event.charCode !== 13) return;
			addresses = await activeMode.ModeFunction();
	}

	async function onAddressDelete(){
		const newAddresses = await window.api.DeleteAddressFromList(<string> this.bechAddress)
		addresses = prepareAddresses(newAddresses)
	}

	async function onAddressCopied(){
		await window.api.AddressCopied(<string> this.bechAddress)
	}

	window.api.ListenToAddressesLoaded((event, newAddressList) => {
		addresses = prepareAddresses(newAddressList);
	})

	window.api.ListenToBalanceChanges((event, newAddressList) => {
		addresses = prepareAddresses(newAddressList);
	})

</script>

<main class="panel m-1">
	<div class="panel-heading columns">
		<div class="logo mr-2" alt="iota logo"></div> 
		<span class="mr-3">|</span>
		<span>ADDRESS BOOK</span>
	</div>
	<InputOptions {inputModes} {changeInputMode} />
	<div class="panel-block columns address-input-panel">
		<TextInput {onInput} {placeholder} onKeypress={onInputKeypress}  />	
	</div>
	<AddressList {onAddressDelete} {onAddressCopied} {addresses} />
</main>

<style>	
	main {
		text-align: center;
		padding: 1em;
		margin: 0 auto;
	}

	.logo {
  		background-color: white;
    	width: 5vw;
    	-webkit-mask: url('./assets/iota-miota-logo.svg') no-repeat center;
    	mask: url('./assets/iota-miota-logo.svg') no-repeat center;
	}

	.address-input-panel {
		border-bottom: none !important;
		margin-bottom: 0 !important;
	}

	.panel-heading {
		color: white;
		background-color: #131f37;
	}
</style>

	<div class="columns panel-tabs">
		<InputModes {inputModes} {onChangeInputMode} />
	</div>
	<div class="panel-block columns address-input-panel">
		<TextInput {onInput} {placeholder} onKeypress={onInputKeypress}  />	
	</div>
	<AddressList {onAddressDelete} {onAddressCopied} {addresses} />
</main>
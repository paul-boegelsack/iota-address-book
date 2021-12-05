<script lang="ts">
	import 'bulma/css/bulma.css'
	import '@fortawesome/fontawesome-free/js/all'
	import { DoubleBounce } from 'svelte-loading-spinners'

	import type { Address } from './lib/interfaces/address'
	import { InputMode, ModeFunction } from './lib/InputMode'
	import Header from './components/Header.svelte'
	import TextInput from './components/common/TextInput.svelte'
	import InputModes from './components/InputModes.svelte'
	import AddressList from './components/AddressList.svelte'

	let addressInput: string = '';
	let addresses: Address[] = []
	let spinnerActive = true;

	const checkInput = () => {
		if(addressInput.length != 64) return false;
		const reg = /[iota]{4}[a-z0-9]{60}/g
		const match = addressInput.match(reg);
		if(match) return true;
		return false;
	}

	const prepareAddresses = (newAddresses) => newAddresses.map(address => {
		let active = true;
		const exists = addresses.find(oldAddress => oldAddress.bechAddress === address.bechAddress)
		if(exists) active = exists.active;
		return {...address, active}
	});

	const searchAddress: ModeFunction = () => new Promise((resolve) => {
		if(addressInput === '')
			resolve(addresses.map(address =>  ({...address, active: true})))

		addresses.forEach(address => {
			address.active = address.bechAddress.includes(addressInput) ||
				address.balance === addressInput;
		})
		resolve([...addresses]);
	})

	const addAddress: ModeFunction = async () => {
		if(checkInput() === false) return addresses;
		const newAddresses = await window.api.UpdateAddressList(addressInput);
		return prepareAddresses(newAddresses);
	}

	const addMode = new InputMode('Add', 'Enter address', true, addAddress)
	const searchMode = new InputMode('Search', 'Search for address or balance', false, searchAddress)

	let inputModes = [addMode, searchMode]
	let activeMode = addMode
	let placeholder = activeMode.GetPlaceholder();

	function changeInputMode(modeName){
		inputModes.forEach(mode => {
            if(mode.GetName() === modeName){
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

	function onInput(event) {
		addressInput = event.target.value;
	}

	function onChangeInputMode (event){
		event.preventDefault;
		changeInputMode(this.name)
    }

	async function onInputKeypress (event) {
		if(event.charCode !== 13) return;
		spinnerActive = true;
		addresses = await activeMode.ModeFunction();
		spinnerActive = false;
	}

	async function onAddressDelete(){
		spinnerActive = true;
		const newAddresses = await window.api.DeleteAddressFromList(<string> this.bechAddress)
		addresses = prepareAddresses(newAddresses)
		spinnerActive = false;
	}

	async function onAddressCopied(){
		spinnerActive = true;
		await window.api.AddressCopied(<string> this.bechAddress)
		spinnerActive = false;
	}

	window.api.ListenToAddModeSet(() => {
		changeInputMode('Add')
	})

	window.api.ListenToSearchModeSet(() => {
		changeInputMode('Search');
	})

	window.api.ListenToAddressesLoaded((event, newAddressList) => {
		addresses = prepareAddresses(newAddressList);
		spinnerActive = false;
	})

	window.api.ListenToBalanceChanged((event, newAddressList) => {
		addresses = prepareAddresses(newAddressList);
	})

</script>

<style>	
	main {
		text-align: center;
		padding: 1em;
		padding-bottom: 0;
		margin: 0 auto;
	}

	.spinner-wrapper{
		opacity: 0;
		position: fixed;
  		top: 50%;
  		left: 50%;
  		transform: translate(-50%, -50%);
		transition: opacity 1s;
	}

	.spinner-wrapper.active{
		opacity: 1;
		transition: opacity 1s;
	}

	.address-input-panel {
		border-bottom: none !important;
		margin-bottom: 0 !important;
	}

	.panel-heading {
		color: white;
		background-color: #131f37;
		display: flex !important
	}
</style>

<main class="panel m-1">
	<div class="panel-heading columns">
		<Header />
	</div>
	<div class="columns panel-tabs">
		<InputModes {inputModes} {onChangeInputMode} />
	</div>
	<div class="panel-block columns address-input-panel">
		<TextInput {onInput} {placeholder} onKeypress={onInputKeypress}  />	
	</div>
	<AddressList {onAddressDelete} {onAddressCopied} {addresses} />
</main>
<div class="spinner-wrapper" class:active={spinnerActive}>
	<DoubleBounce size="60" color="#131f37" unit="px" duration="1s"></DoubleBounce>
</div>
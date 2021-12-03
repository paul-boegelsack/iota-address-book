<script lang="ts">
	import 'bulma/css/bulma.css';
	import '@fortawesome/fontawesome-free/js/all'
	import TextInput from './components/common/TextInput.svelte'
	import InputOptions from './components/InputOptions.svelte'
	import AddressList from './components/AddressList.svelte'

	let addressInput = "";
	let addresses = []
	let inputModes = [
		{name: "Add", placeholder: "Enter address", active: true},
		{name: "Search",  placeholder: "Search for address or balance", active: false}
	]
	let activeMode = inputModes[0]
	let placeholder = activeMode.placeholder;

	const searchAddress = () => {
        if(addressInput === "" || activeMode.name !== "Search") 
			return addresses.map(address => {return {...address, active: true}})

        addresses.forEach(address => {
            address.active = address.bechAddress.includes(addressInput) || 
                address.balance === addressInput;
        })
        return [...addresses];
    }

	const addAddress = async () => {
		const newAddresses = await window.api.UpdateAddressList(addressInput);
		return prepareAddresses(newAddresses);
	}

	const prepareAddresses = (newAddresses) => {
		return newAddresses.map(address => {return {...address, active: true}});
	}

	const onInput = (event) => {
		addressInput = event.target.value;
	}

	const onInputKeypress = async (event) => {
		if(event.charCode === 13){
			switch(activeMode.name){
				case "Add":
					addresses = await addAddress();
					break;
				case "Search":
					addresses = searchAddress();
					break;
				default:
					return;
			}
			
		}
	}

	function changeInputMode (event){
		event.preventDefault;
		inputModes.forEach(mode => {
            if(mode.name === this.name){
				placeholder = mode.placeholder;
				mode.active = true;
				activeMode = mode;
                return mode
			}

            mode.active = false;
			return mode;
        })
		inputModes = [...inputModes];
    }

	async function onAddressDelete(){
	async function onAddressCopied(){
		await window.api.AddressCopied(this.bechAddress)
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
		width:5vw;
  		-webkit-mask: url(assets/iota-miota-logo.svg) no-repeat center;
		mask: url(assets/iota-miota-logo.svg) no-repeat center;
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

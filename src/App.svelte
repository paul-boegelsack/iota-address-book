<script lang="ts">
	import 'bulma/css/bulma.css';
	import TextInput from './components/common/TextInput.svelte'
	import InputOptions from './components/InputOptions.svelte'
	import AddressList from './components/AddressList.svelte'

	const addresses = [
		{
			id: 0,
			txid: "ALSDIOWJLASDFJOIWOWKKDLFHLAHELIHLSDIHHHLIE",
			balance: 12.320
		},
		{
			id: 1,
			txid: "TMASDKEAKASDJFKEAASDASKDAKSFJSJKEJKJEKSJE",
			balance: 12.320
		},
		{
			id: 2,
			txid: "YJIOWHOWIHOIHOIDFLYLKKLWIEHWLIHPQOIHSOIDF",
			balance: 12.320
		}
	]
</script>

<main class="panel m-1">
	<div class="panel-heading columns">
		<div class="logo mr-2" alt="iota logo"></div> 
		<span class="mr-3">|</span>
		<span>ADDRESS BOOK</span>
	</div>
	<InputOptions />
	<div class="panel-block columns">
		<TextInput />	
	</div>
	<AddressList {addresses} />
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

	.panel-heading {
		color: white;
		background-color: #131f37;
	}
</style>

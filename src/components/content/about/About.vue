<template>
  <div>
    <!-- <img src="../../../assets/logo.png" /> -->
    <div class="logo-holder">
      <div class="logo-item">
        <img
          src="@/assets/logo_300.png"
          style="width:150px; height:150px;"
          :class="{ animate: animated }"
          @click="animate"
          @animationend="animated = false"
        />
      </div>
      <div class="logo-item">
        <span>inschpektor</span>
      </div>
    </div>

    <p>
      <strong>Installed Version:</strong>
      {{
        inschpektorVersions
          ? inschpektorVersions.installed
            ? inschpektorVersions.installed
            : 'N/A'
          : 'N/A'
      }}
    </p>
    <p
      v-if="
        inschpektorVersions &&
          inschpektorVersions.newest &&
          inschpektorVersions.installed &&
          inschpektorVersions.newest > inschpektorVersions.installed
      "
      class="update-available"
    >
      <strong>🌟 Update available!</strong>
      Version
      {{ inschpektorVersions.newest }} is ready to download! See here how to
      update:
      <a
        href="https://github.com/codepleb/inschpektor/blob/master/readme.md#update"
        target="_blank"
        >Update manual</a
      >
      🌟
    </p>
    <br />
    <p>
      This is an open source app, that can be found @
      <a href="https://github.com/codepleb/inschpektor">Github</a>.
    </p>
    <p>The application is based on Nodejs and Vuejs.</p>
    <br />
    <p>
      If you would like to contribute: I'd love to get your pullrequests. :)
    </p>
    <p>Hit me up on telegram: @codepleb</p>
    <br />
    <br />
    <h3 class="title is-3">Donations</h3>
    <p>
      If you like this app and you want to support me, use the following IOTA
      address:
    </p>

    <Donation
      address="IZ99FQWJUQJCDLBSUOEDZIVROSARFYLXJWPZNAXQPCCGAHCUWKRE9RNHMGNHZTAIZHPUDV9HMSPNJLYSXPNEPTRHUW"
    />

    <section>
      <h5 class="title is-5">Other Coins</h5>
      <p><strong>BTC:</strong> 32o6kbgZqJ9nhT2aRsfEGcMtpThJ2za89T</p>
      <p><strong>LTC:</strong> LgfSNjqVpXFj9xN8ZWPR9qTZQJpcRRNXRZ</p>
      <p>
        <strong>XMR:</strong>
        4GdoN7NCTi8a5gZug7PrwZNKjvHFmKeV11L6pNJPgj5QNEHsN6eeX3DaAQFwZ1ufD4LYCZKArktt113W7QjWvQ7CWAjwVCr95LATLKqtxr
      </p>
      <p>
        <strong>XLM:</strong>
        GA5XIGA5C7QTPTWXQHY6MCJRMTRZDOSHR6EFIBNDQTCQHG262N4GGKTM
      </p>
      <p><strong>XRP:</strong> rLHzPsX6oXkzU2qL12kHCH8G8cnZv1rBJh</p>
    </section>
  </div>
</template>

<script>
import Donation from './Donation';
import { mapGetters } from 'vuex';

export default {
  name: 'About',
  data: () => {
    return {
      animated: false
    };
  },
  computed: {
    ...mapGetters(['inschpektorVersions'])
  },
  methods: {
    animate() {
      this.animated = true;
    }
  },
  components: {
    Donation
  }
};
</script>

<style scoped>
.update-available {
  background: hsl(141, 71%, 70%);
  border-radius: 1vh;
}

.logo-item {
  margin: 5px;
  color: black;
  font-size: 40px;
  font-family: monospace;
}

.logo-item:last-child {
  margin-bottom: 20px;
}

section {
  margin-top: 30px;
}

.animate {
  animation: spin 3s;
  animation-timing-function: ease-in-out;
}

@keyframes spin {
  20% {
    transform: rotate(360deg);
  }
  40% {
    transform: rotate(720deg);
  }
}
</style>

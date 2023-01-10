<template>
  <div class="fill-height">
    <v-container v-if="web3 && connected" class="fill-height">
      <v-row justify="center">
        <v-col md="6">
          <v-card class="fill-width">
            <v-card-title>
              <v-avatar size="24" class="mr-2">
                <img :src="require('@/assets/logo.png')" alt="list" />
              </v-avatar>
              <span class="title font-weight-light">
                {{ $t("LP List") }}
              </span>
            </v-card-title>
            <v-card-text v-if="chainId === 128 && rewardsDataList.length > 0">
              <v-card
                v-for="item in rewardsDataList"
                :key="item.address"
                :loading="loading"
                class="mb-4"
              >
                <v-card-title>
                  <span class="title font-weight-light">
                    {{ item.name }} {{ $t("Available Amount") }}
                  </span>
                </v-card-title>
                <v-divider class="mx-4"></v-divider>
                <v-card-text>
                  <v-row align="center">
                    <v-col class="display-3" cols="12">
                      {{ item.rewardsAmount }}
                    </v-col>
                  </v-row>
                </v-card-text>
                <v-divider
                  class="mx-4"
                  v-if="parseFloat(item.rewardsAmount) > 0"
                ></v-divider>
                <v-card-actions
                  class="justify-center"
                  v-if="parseFloat(item.rewardsAmount) > 0"
                >
                  <v-btn
                    color="#93B954"
                    dark
                    width="80%"
                    @click="submit(item)"
                    :disabled="parseFloat(item.rewardsAmount) <= 0"
                  >
                    {{ $t("Claim") }}
                  </v-btn>
                </v-card-actions>
                <v-divider class="mx-4"></v-divider>
                <v-card-text>
                  <v-row align="center">
                    <v-col class="body-1" cols="12">
                      <p @click="handleCopy(item.lpAddress, $event)">
                        LP Address: {{ item.lpAddress }}
                        <v-icon>mdi-content-copy</v-icon>
                      </p>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-card-text>
            <v-card-text v-else>
              <v-row align="center">
                <v-col class="body-3" cols="12">
                  {{ $t("No Data") }}
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
          <!-- 当前钱包账号 -->
          <v-card justify="center" class="fill-width mt-10">
            <v-card-title>
              <span class="title font-weight-light">
                {{ $t("Current Token Address") }}
              </span>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <v-row align="center">
                <v-col
                  class="body-1"
                  cols="12"
                  @click="handleCopy(address, $event)"
                >
                  <p>
                    {{ address }}
                    <v-icon>mdi-content-copy</v-icon>
                  </p>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
          <!-- 遮罩层 -->
          <v-overlay z-index="9999" opacity="0.7" :value="loading">
            <v-progress-circular indeterminate size="64"></v-progress-circular>
          </v-overlay>
          <!-- 提示层 -->
          <v-snackbar
            v-model="operationResult.snackbar"
            :color="operationResult.color"
            centered
            top
            timeout="4000"
          >
            {{ $t(operationResult.text) }}
          </v-snackbar>
        </v-col>
      </v-row>
    </v-container>
    <v-container v-else>
      <v-row justify="center">
        <v-col md="6">
          <v-card justify="center" class="fill-width">
            <v-card-actions class="justify-center">
              <!-- 连接钱包 -->
              <v-btn
                class="mr-2"
                v-if="!connected"
                color="#93B954"
                block
                @click="onConnect"
              >
                {{ $t("Connect Wallet") }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { validationMixin } from "vuelidate";
import clip from "@/utils/clipboard";
import { compare } from "@/filters/index";
import { getContractByABI, weiToEther, etherToWei } from "@/utils/web3";
// import { WHITE_LISTS_SWITCH, WHITE_LISTS } from "@/constants/index";
// 引入合约 ABI 文件
import CommunityRewards_ABI from "@/constants/contractJson/CommunityRewardsApprove_abi.json";

export default {
  name: "AllocationFee",
  mixins: [validationMixin],
  data: () => ({
    loading: false,
    // LP合约列表
    lpContractList: [
      {
        name: "USDT-UNI",
        address: "0x34309313C978C0127d5854b71465676bcD06858F",
        lpAddress: "0x9d6bd058A8364C813b623CD16cfeB0a99Bf46e56"
      },
      {
        name: "USDT-FIL",
        address: "0xbCe880EE6f8E7048a6E0Ec735E18D6A9f667D04F",
        lpAddress: "0xd9778D0937953E77Bbac603ee9631F421A8E09F1"
      },
      {
        name: "USDT-DAO",
        address: "0xb73A35b7E2c7F86d801d7fC8D8C7ac9FC80332F6",
        lpAddress: "0x1dbCac9E084A25d542893B14128a5910dF43a6b7"
      },
      {
        name: "USDT-BCH",
        address: "0xc3a0e7602A559830CC8810e44377Fd9326476072",
        lpAddress: "0x716F8f6F9da4178A41b1649deaA4Dc280a548223"
      },
      {
        name: "USDT-MANA",
        address: "0xabf0831296766eeD8a2960592fDDd725398eBa17",
        lpAddress: "0x75f7d3f41A96c85CDD463968CBCEf1cf873a2bD6"
      },
      {
        name: "USDT-MDX",
        address: "0x681EAB82Dc6fef84CABD2a4ee7d862C7aD4474d6",
        lpAddress: "0x1dc0781526E55E270dC06E08c2e1EFB88CCd3F2F"
      }
    ],
    // 记录列表
    rewardsDataList: [],
    // 提示框
    operationResult: {
      color: "success",
      snackbar: false,
      text: `Hello`
    }
  }),
  created() {
    if (this.web3 && this.connected) {
      this.getAccountAssets();
    } else {
      this.onConnect();
    }
  },
  watch: {
    web3(web3) {
      if (web3) {
        this.getAccountAssets();
      }
    },
    address(address) {
      if (address) {
        this.getAccountAssets();
      }
    }
  },
  computed: {
    connected() {
      return this.$store.state.web3.connected;
    },
    web3() {
      return this.$store.state.web3.web3;
    },
    address() {
      return this.$store.state.web3.address;
      // return "0x7d3dE024dEB70741c6Dfa0FaD57775A47C227AE2";
    },
    chainId() {
      return this.$store.state.web3.chainId;
    }
  },
  methods: {
    // 连接钱包 OK
    onConnect() {
      this.$store.dispatch("web3/connect");
    },
    // 断开连接钱包 OK
    closeWallet() {
      this.$store.dispatch("web3/closeWallet");
    },
    // 复制地址
    handleCopy(text, event) {
      clip(text, event);
      this.operationResult.color = "success";
      this.operationResult.snackbar = true;
      this.operationResult.text = "Cope Success";
    },
    // 获取账号信息
    async getAccountAssets() {
      this.loading = true;
      try {
        // WHITE_LISTS_SWITCH &&
        // WHITE_LISTS.indexOf(this.address) > -1 &&
        if (this.lpContractList.length > 0) {
          this.rewardsDataList = [];
          this.loading = true;
          const getResult = this.lpContractList.map(async item => {
            const contract = await getContractByABI(
              CommunityRewards_ABI,
              item.address,
              this.web3
            );
            const rewardsInfo = await contract.methods
              .getRewardsInfoByAccount()
              .call({ from: this.address });
            const rewardsAmount = weiToEther(
              rewardsInfo.rewardsAmount,
              this.web3
            );
            if (parseFloat(rewardsAmount) >= 0) {
              const tempData = {
                name: item.name,
                address: item.address,
                lpAddress: item.lpAddress,
                rewardsAmount: rewardsAmount
              };
              this.rewardsDataList.push(tempData);
            }
          });
          await Promise.all(getResult);
          this.rewardsDataList.sort(compare("address"));
          this.loading = false;
        }
      } catch (error) {
        console.info(error);
      }
      this.loading = false;
    },
    // 提币 TODO OK
    submit(record) {
      this.loading = true;
      // 处理额度
      const rewardsAmount = etherToWei(record.rewardsAmount, this.web3);
      // 执行合约
      getContractByABI(CommunityRewards_ABI, record.address, this.web3)
        .methods.getReward(rewardsAmount)
        .send({ from: this.address })
        .then(() => {
          this.loading = false;
          this.getAccountAssets();
        })
        .catch(e => {
          this.loading = false;
          console.info(e);
        });
    }
  }
};
</script>

<style lang="sass">
.theme--dark.v-btn.v-btn--disabled.v-btn--has-bg
  background-color: rgb(147, 185, 84) !important
  border-color: rgb(147, 185, 84) !important
  opacity: 0.5 !important

.v-btn--disabled
  background-color: rgb(147, 185, 84)
  border-color: rgb(147, 185, 84)
  opacity: 0.5
</style>

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
            <v-card-text v-if="rewardsDataList.length > 0">
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
                    @click="submit(item.lpAddress)"
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
import { getContractByABI, weiToEther, toChecksumAddress } from "@/utils/web3";
import {
  ContractAddress
  // WHITE_LISTS_SWITCH,
  // WHITE_LISTS
} from "@/constants/index";
// 引入合约 ABI 文件
import AllocationFee_ABI from "@/constants/contractJson/AllocationFeeCommon_abi.json";

export default {
  name: "AllocationFee",
  mixins: [validationMixin],
  data: () => ({
    loading: false,
    // LP奖励信息表
    lpRewardInfoList: [],
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
      // if (WHITE_LISTS_SWITCH && WHITE_LISTS.indexOf(this.address) > -1) {
      await this.getLPRewardInfo();
      this.loading = true;
      this.rewardsDataList = [];
      try {
        const contract = await getContractByABI(
          AllocationFee_ABI,
          ContractAddress,
          this.web3
        );
        if (this.lpRewardInfoList.length > 0) {
          this.loading = true;
          const getResult = this.lpRewardInfoList.map(async item => {
            const rewardsInfo = await contract.methods
              .queryRewardInfo(item.token)
              .call({ from: this.address });
            const rewardsAmount = weiToEther(rewardsInfo.amount, this.web3);
            if (parseFloat(rewardsAmount) >= 0) {
              const tempData = {
                name: item.name,
                lpAddress: item.token,
                rewardsAmount: rewardsAmount
              };
              this.rewardsDataList.push(tempData);
            }
          });
          await Promise.all(getResult);
          this.loading = false;
        }
      } catch (error) {
        console.info(error);
      }
      this.loading = false;
      // }
    },
    // 获取LP信息信息
    async getLPRewardInfo() {
      this.loading = true;
      this.lpRewardInfoList = [];
      try {
        const contract = await getContractByABI(
          AllocationFee_ABI,
          ContractAddress,
          this.web3
        );
        const lpRewardAddressList = await contract.methods
          .getLPRewardAddressList()
          .call();

        if (lpRewardAddressList.length > 0) {
          this.loading = true;
          const getResult = lpRewardAddressList.map(async item => {
            const rewardsInfo = await contract.methods
              .getRewardInfo(item)
              .call({ from: this.address });
            const tempData = {
              name: rewardsInfo.name,
              token: rewardsInfo.token,
              amount: weiToEther(rewardsInfo.amount, this.web3)
            };
            this.lpRewardInfoList.push(tempData);
          });
          await Promise.all(getResult);
          this.loading = false;
        }
      } catch (error) {
        console.info(error);
      }
      this.loading = false;
    },
    // 提币 TODO OK
    submit(lpAddress) {
      this.loading = true;
      // 执行合约
      getContractByABI(AllocationFee_ABI, ContractAddress, this.web3)
        .methods.getReward(toChecksumAddress(lpAddress))
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

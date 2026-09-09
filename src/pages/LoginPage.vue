<template>
  <div class="loginPage">
    <img class="bg" src="/clone-assets/login/bg.png" alt="" />
    <div class="loginContent">
<!--   模式切换使用   <ThemeToggle class="loginTheme" />-->
      <div class="service" title="客服咨询">
        <div class="img40">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
            <path
              fill="currentColor"
              d="M864 409.6a192 192 0 0 1-37.888 349.44A256.064 256.064 0 0 1 576 960h-96a32 32 0 1 1 0-64h96a192.064 192.064 0 0 0 181.12-128H736a32 32 0 0 1-32-32V416a32 32 0 0 1 32-32h32c10.368 0 20.544.832 30.528 2.432a288 288 0 0 0-573.056 0A193.235 193.235 0 0 1 256 384h32a32 32 0 0 1 32 32v320a32 32 0 0 1-32 32h-32a192 192 0 0 1-96-358.4 352 352 0 0 1 704 0M256 448a128 128 0 1 0 0 256zm640 128a128 128 0 0 0-128-128v256a128 128 0 0 0 128-128"
            />
          </svg>
        </div>
      </div>
      <div class="flex jc">
        <img src="/clone-assets/login/mascot.png" class="img150" alt="" />
      </div>
      <div class="tc size35 mt10 mb30">{{ title }}</div>

      <template v-if="mode !== 'email'">
        <div class="password flex ac mb20">
          <img :src="icons.phone" class="img30" alt="" />
          <input
            v-model="phone"
            class="flex1 ml20 size20 inp"
            type="tel"
            inputmode="numeric"
            maxlength="11"
            placeholder="输入手机号"
            @blur="touch('phone')"
          />
        </div>
        <p v-if="errors.phone" class="fieldError">{{ errors.phone }}</p>
      </template>
      <template v-else>
        <div class="password flex ac mb20">
          <div class="img30 emailSvg">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
              <path
                fill="#7e8796"
                d="M192 192h640a64 64 0 0 1 64 64v512a64 64 0 0 1-64 64H192a64 64 0 0 1-64-64V256a64 64 0 0 1 64-64m0 86.336 288.768 216.576a32 32 0 0 0 38.464 0L808 278.336V256H192zm0 67.328V768h640V345.664L562.432 526.976a96 96 0 0 1-115.456 0z"
              />
            </svg>
          </div>
          <input
            v-model="email"
            class="flex1 ml20 size20 inp"
            type="email"
            maxlength="64"
            placeholder="输入邮箱"
            @blur="touch('email')"
          />
        </div>
        <p v-if="errors.email" class="fieldError">{{ errors.email }}</p>
      </template>

      <div v-if="mode === 'password' || mode === 'email'" class="password flex ac">
        <img :src="icons.lock" class="img30" alt="" />
        <input
          v-model="password"
          class="flex1 ml20 size20 inp"
          :type="showPassword ? 'text' : 'password'"
          maxlength="20"
          placeholder="输入登录密码"
          @blur="touch('password')"
        />
        <div class="flex0 ml30 hand" @click="showPassword = !showPassword">
          <img :src="showPassword ? icons.eyeOff : icons.eye" class="img30" alt="" />
        </div>
      </div>
      <p v-if="(mode === 'password' || mode === 'email') && errors.password" class="fieldError">
        {{ errors.password }}
      </p>

      <div v-if="mode === 'code' || mode === 'register' || mode === 'forgot'" class="password flex ac">
        <img :src="icons.code" class="img30 size20" alt="" />
        <input
          v-model="sms"
          class="flex1 ml20 size20 inp"
          type="text"
          inputmode="numeric"
          maxlength="6"
          placeholder="输入验证码"
          @blur="touch('sms')"
        />
        <div class="flex0 ml30">
          <div class="mainColor size20 hand" :class="{ opc6: cooldown > 0 }" @click="sendCode">
            {{ cooldown > 0 ? `${cooldown}s` : "发送验证码" }}
          </div>
        </div>
      </div>
      <p v-if="mode !== 'password' && mode !== 'email' && errors.sms" class="fieldError">
        {{ errors.sms }}
      </p>

<!--      <div v-if="mode === 'password' || mode === 'code'" class="flex jb size18 mt20">
        <div class="mainColor hand" @click="mode = mode === 'password' ? 'code' : 'password'">
          {{ mode === 'password' ? "用验证码登录" : "用密码登录" }}
        </div>
        <div class="hand forget" @click="mode = 'forgot'">忘记密码？</div>
      </div>-->
      <div v-else-if="mode === 'forgot'" class="flex jb size18 mt20">
        <div class="mainColor hand" @click="mode = 'password'">返回登录</div>
        <div />
      </div>
      <div v-else-if="mode === 'email'" class="flex jb size18 mt20">
        <div class="mainColor hand" @click="mode = 'password'">返回手机登录</div>
        <div />
      </div>

      <button type="button" class="click btn mt30 size24" :disabled="submitting" @click="submit">
        {{ submitting ? "登录中..." : actionText }}
      </button>

      <div v-if="mode === 'register'" class="tc size20 mt30">
        <span>已有账号？</span>
        <span class="mainColor hand" @click="mode = 'password'">立即登录</span>
      </div>
<!--
      <div v-else class="tc size20 mt30">
        <span>还没有账号？</span>
        <span class="mainColor hand" @click="mode = 'register'">立即注册</span>
      </div>
-->

      <template v-if="mode === 'register'">
        <div class="agree flex ac mt30 size20">
          <input v-model="agreed" type="checkbox" class="agreeBox" />
          <span class="ml10 gray">我已阅读并同意《用户协议》和《隐私政策》</span>
        </div>
        <p v-if="errors.agreed" class="fieldError">{{ errors.agreed }}</p>
      </template>
<!--      <template v-else>
        <div class="flex jc ac mt30">
          <img :src="icons.line" class="pic6" alt="" />
          <div class="size12 txt">或使用以下方式继续</div>
          <img :src="icons.line" class="pic6" alt="" />
        </div>
        <div class="flex jc as mt30">
          <div class="other flex ac jc hand mr30" @click="thirdParty('微信')">
            <img src="/clone-assets/login/wechat.png" class="img40 mr10" alt="" />
            <div class="size-20">微信</div>
          </div>
          <div class="other flex ac jc hand" @click="mode = 'email'">
            <div class="img40 mr10 emailSvg">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                <path
                  fill="currentColor"
                  d="M192 192h640a64 64 0 0 1 64 64v512a64 64 0 0 1-64 64H192a64 64 0 0 1-64-64V256a64 64 0 0 1 64-64m0 86.336 288.768 216.576a32 32 0 0 0 38.464 0L808 278.336V256H192zm0 67.328V768h640V345.664L562.432 526.976a96 96 0 0 1-115.456 0z"
                />
              </svg>
            </div>
            <div class="size-20">国外邮箱</div>
          </div>
        </div>
      </template>-->
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import {loginByPassword, sendSms} from "@/api/auth";
import { applyLogin, fetchMe } from "@/composables/useAuth";
import {
  agreeRules,
  collectFieldErrors,
  emailRules,
  passwordRules,
  phoneRules,
  smsCodeRules,
  validate,
  type FieldBag,
} from "@/lib/rules";

const router = useRouter();
const route = useRoute();
const mode = ref<"password" | "code" | "register" | "forgot" | "email">("code");
const phone = ref("");
const email = ref("");
const password = ref("");
const sms = ref("");
const showPassword = ref(false);
const agreed = ref(false);
const submitting = ref(false);
const cooldown = ref(0);
const errors = ref<Record<string, string>>({});
let timer: number | undefined;

const title = computed(() => {
  if (mode.value === "register") return "注册新账户";
  if (mode.value === "forgot") return "找回密码";
  if (mode.value === "email") return "登录您的账号";
  return "登录您的账号";
});

const actionText = computed(() => {
  if (mode.value === "register") return "注册";
  if (mode.value === "forgot") return "重置密码";
  return "登录";
});

const icons = {
  phone:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAACIUlEQVR4AaRUwWoTURS9dyYxi1IqiKLgotCNIEWlICLdFJWC+yAIggsRNVZwk9Ik09QkzbRdxhldiCh+g4JrxZ1YqVgR/6DUhbSipZN3PW8GhZn3xpY2vPPyzj3nngkzc+NQzqe6uDjoLTxqeH6wAmx6frg+2w1eN3rB5ZyWuGwNnPMfD5f6A8ss0mbiUWCAiQ4R86TD/ArBQdxt2YzAcrnsKlIvmXnE4k9KzJVZP7yfkPRuBJ4Ym7gCy0ngv0uImlNTvVLWZASSyKWsycZxC4YOHiuczWpGIBMPZk15XEgNZTUjUES+ZU25vFD4mtXMQJdeZE12zu861VvGxY3AznTlC35lyx6SVPFANrYlupmw9G4Earldu9sUoWkh+al5GrLaVzzu1+6tpusJswZqqV2rLLlbxWE89evC0iSSqiKadLbWR7v1OyvaY4M10Gv1Tnl+cCMqRbcxHcdZaBvNBUzOOVU6XNfa3Hx4GjVjpQLrnfC854fvueh+xOvzBGILHR0i7mpgeh4QUUtryqFleD80F8Jx1P4t9CRnb/7hVdelt0w0llR23uE9o4TeYLav/XXHgfrPAFd/hmLM8b3rhVAW5qeNpd6IbooD+tSfwb06oAt7AUKLjnJndG8ciEvsan51Qy6ELmgtDhSmo5rsE0d0fxzIJN812R/4h+6PA1UUXcQ46Rn+jOIaCW2C/8L5tw1aAzagrQGfcH6O12gCZ/oDAAD//2CtIuAAAAAGSURBVAMAViSpjhKFfKsAAAAASUVORK5CYII=",
  lock:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAACcUlEQVR4AZxTS2gTURQ9901LimiLiB+6sHSjgrhRcafo0s/Sha7cCY0JCNLSya9DEpIGuxBNKgpBN4KgIFRQ3LkVlKK489MW3RQXrdAaiMm73jvEkDCTiH3cM+9+z7y5745Bj+V597ZlipUbmUL5TbpYWc8UKj/FfpsuVKanStUdPcoQSpjK3Rm3kcaiFM2B6AQBIyAMi32MCMVIs/Y+lZs/KHZAAoSe5w2ZAfNSMg+AscFEMww6zjBHAUoAWCOicXL41VSpFDhpgNBGdk9Ikb69IWSnc9PRbM6Nvsu5E4tZN1o01pwCuE6EsSG7/brkdkmAkJnPtjKeKFFLb29ecuIjAw+hi/mCbp0IEBLRXk0gwjfdw0AwX6GLaI9unQgQAiQHAGDDL0wiYGK5J9EILM8uaRPG47cjM3O39gPs+xgcSebLY2Eg5mFlYctGazzvwZDaCr84XZg/uXPUWWYeXBHnEQFAFHccWg4DQC5kEdGY1jQjv76nCuVz4mp9FnFVjH2CLYl8/y5DdF+L/ROKEmiu+NrCjBUwf2k7whTGiLp9QpJZUaM36ErT8qXecYm0LsgnZFBNXH2kYY3jcJ8EDdX14RMK+Qc1ekHYuGntvwg/a71PKJkv1OgF0+RRQ+h7adK1Ba33CWuDtarM3ao6QmHosSF6HhpTJ2H9N5m7qvqEc5OTm/KGq+oIg4yFSGvEwhIYsVk3uqYhn1CVfCK+IG2Kqf4/sOCprHvt0d+aNqE68slYxcCekZ5+UrsfdDYt8/m8G7vZmddFqAHPjb9eXRo4DNiLUvRUWrEk/g3p8SZ0wIFn8g9fduo/DuUTscBl/gEAAP//uWe4RgAAAAZJREFUAwBLveWGECP4rQAAAABJRU5ErkJggg==",
  eye:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAB2NJREFUaEPtWWuQFNUV/k7PzsL6WuGHotGyohLUFaZnWcMyPUhmehcU3yWFUVHLUiE/QmKZ0iRFKjGGSqpMUkSLpHzFqsRH6Q+xxNci07Nm2W5XXJjuRRA1wTIJVAy4QLBc5nVPqofp3p7ZmZ2ZZqiEKu+/uX3Od75z77nnnnuGcIIPOsH54ysH/tc7eELsgKabvwCwgpkf6ImG/+RdtP97BzTD/BEYv3JIpwNH2pd0d//H+d00BzYND7e3ZFrPEshPJ8Y0wdIMSDgFzAECHwbRfha0XwKPZon2LVZC/64VfgnDXEmMxzxye6VM+wWx2NePNMWBTcbI7IDgqxl8FQghAKfUIlX8nmbgAwADBLwuRG5X74Kuv3t1NT11D0BPeObGcrnArMULZ//jmEKoX7cuFSzuAEkKwPPrJFxDTFqoKnMGHKGkkbqFmZ7zKB0kIb4VX9BplQPVHUKJoe1zKJ9bBdDdzSF9FIWIV8YjYXelE4Z1BTG/6bGRk1jMj0U7hyvZrenA4OCuU49gbB0R3d5M4kexeIWqhJ90cBODqV4iestj51AwL2Zefnnnvmq2J3UgaaRWMNPPAJzddPJE96uR0G/GyVsLiNgNo+L8QQKvjivhPzTsQFI3f8vAfU0nXggb/DQeke3cXhiFcwXeXtUW8ZtZtC6/ItIxWvMMPMgsLXjHMsCYd0zkibdCSB+ShCwLvhAEpRDzwMNxRf6he2AHrVlMBfLBGvY+AwKKqsz+m1euJIReHR4+qS3dohMg+yLP+BeIHhJS7u3e+XPtNOkOTd92HrE0Nx6V17ths3nkfJLEOwDOqNPeqJDyUS92iQOabtoHqLdOsHKx/iwFl1ba5kp4/f2p07mVRhg4t0F7e8WU3CW9XV2Hijt6VD2hm48Q8L0GwYrivEFVwteV627ePDItJ+XPQ+bg+7FYLOfGfP8nU0XroREAM33ZI96qRsJdrgM1D9EkVojwCaUPfMNLUNNNO8btnVQJeO7IoZPvWrJkZtqGMQyjbUy0DYFoji/yRSXn/iiEkGakhsE01w8ggZbGldBLjq6mmy8DuL74e8fnez4KLVu2LD/+3Xob4IV+bJXppFVFnkob/7L93JaWfEkd0gD4HlWRzxknl/odQN8v/GYeUaNhuz5yh6abSQCx8Rl6EOA2AG5WasA2iOgO0nRrDcCrG1F0ZInwUDwi2xcdEgPbLqGAtKP4bZeUCV4Wi3V84cgmdPM1Aq7y2HlNVeRrNN1cBGCjH/sAD5BmmEN+cz4zL++JhgtFl2ak7gXTWvtM5FtzYSdL2N+SuvksA7d6SL6nKvI3C45PLB8a8eWfpOnmHr+lAjFudPK6k4KlDE+LxcIHPWH1PEA3l7AirFcj8o32XL+x9ULBgY8bYe2RHbUdsOtrN44bAfI6kNDNH0hMH8ejoQ0ORnLQfIwJKydgMnQ1Kkeb4MA+24Gyg1W/C/YhikdCf66kkTCsh4n5/spo/IiqhO89GkJmjAg2Bz9jN9krR4BbFTaGQk+qSmhFuU5y0PoxE/+yOhapqhIqkNZ08zYAFRehFhcGNpJ9W2YkMaHKq6Vc/H5YyhyYXnaJ/QSAW2mW4xDwYlyRv+2eESP1BpiurNNeudji4kVmbgDjmkZB7EssFpmznoi4EA4TH+GlZ5fRt39a8LplHR2ZQvzXKqMnJ7RXVeSvFRzoM3ZMD3L280YcYOZFPdHwpvGVNG8Aw600i/P7AUxl4H0wr3NSrqOT0M2U38qXia7siYT63GpU081VAB6tx4ny8iGhm8sJeMarKwidLen2D8baPmv19nEcmaRhPsWMu+qxV0HmBVWRC6m5rJy2ngD4nslBS9+xScNczIw+j45FTDfFo6EPK+H0D1nniLxYC9BSn+S3qYrs1m0T3sQVrvxxO4xValRe567iZmseSzxUGuhY34Yvl0cikTHv/MDA8FnZluCtYP45gJN8kt8tZdo7aja2NN18GsCdpcRKH+H9g1a3INYBSFXI7GbQKIEFgNMAXFDHs7G6X4R3p4ipvdHoRYe9QlW7EpqeWg3QGluYiX7dEwk94CgWs8dWAK0+V7IhNSL8kdIHvuNN1w7ApG2VhG4tJRbz1GjYvVE36tYZLeBP7ezSEAt/wl8w83fLO9J17UDFA7hlxwyRzdol83R/fBrSWhPMi0cna2pNyEKTwdsdujSNpQCyY/l4jX0MvIxA4Pc93bPtN3PNUbO16CBourUT4ItdRMJOMM5vSigRdjLj6UAm+Lj3EVSTffk9UE1B080tAC7zkF+rRuT7EkPbz6Qcd4KECkY3CPZD/dQahu3e/k4QthBTIhcQI4u6w37fA7X/5KvQK3pGVeSKjd43hoZOa81PmUVCmsEBPhuMk0GUJxZfEqRRYuxBNvvXWKzLLjGaMiYNIU1PvQLQtY4lBr3So4ScjkNTCBwrSFUHypu7xOiLR2W/Ze+x8qyqX/0i8z72PU/A48bEJ3BVBzYZZlgCngX4UzUSXuIT/7ir1Z1GjzsTnwa+csDnwjVN7YTfgf8C1tLllPXMvT0AAAAASUVORK5CYII=",
  eyeOff:
    "data:image/png;base64,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",
  code:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAACUklEQVR4AayUy2sTURTGz7lpDQiCG1c+cVMQlaIrUQSXLlS6ciERXCjYJFJFIZk04zSPCbZYUSZBUFxkVx/4hCK6UPwLlOJOpRYUQarbpp05fvcaw+QJqR3Ox5x7Hr8zN3MzinpfbLtezC6VP0FfbLdyxnGcnj0dk5nC9Oas612wS5U5Yq5i5k5oB7Hc86ObPmbdyphz7dYWxNrMADOF8lYALDxN1XbL71UkOs/MN4lkV2sHEw0xy40gUPPZkvcBQ6voHc8UvO261gBVhF4ycxFPEyOmvWiK6GRvsWLiPRgaQ28+EuFXut4A4egt4bZ6E6JtursOlEAv/kdMZBh1YH8oYbpPJI86dfUNxNa8fCp+MqDg9hoA5Xo+HU9ak94+JepBP8DvKP4GNUxE3Fw6cRlH5MCAz2+IeWMjGXI6bzmgU8viD5PQnK4F7GreSmTsYvkIjshrxDZAHc0AWRg/TSivaCpaW/FrzIcBPQdYzi5WjoqiWVSthzqZYRggsp+hsO0P1kXfsqwM5Kz4HbvkjYiSp0wUDRe1+At6/RfI9FgvmsS0e5Aj7wCbRPwhYIO4dzXs0TAMUC3VplH5E2q1ISK+Apk66nYJL3JtaUqnTaHjXPyNt3ZaB1ajgHx81i4t6l4D1E4uNTqrSM5qvx8JBecLVvLZv54GUAecdOIuMR0nETNNx7oJr/RXIDySTyeb/jFNQN2cS8Wf+wEPM0ljqo6HhXP5QvHycMEafRKOa78NqIPF8fjCRDpxAh+8g1jPQD/qmhEJDuFcHptIjX1FrM3+AAAA///bQ2faAAAABklEQVQDALDhw1nxUPK+AAAAAElFTkSuQmCC",
  line:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAP4AAAACCAYAAAB4xmEzAAAAAXNSR0IArs4c6QAAAEBJREFUSEtjrGuf+p+BgYGhqTKbEURTC1DbXGqbB/Mntc2ltnmj7hxNn9TMn7D0SdXMTq1CY9Sc0RAYDQHahgAA6OkynIQ3Do0AAAAASUVORK5CYII=",
};

function currentFields(): FieldBag {
  if (mode.value === "email") {
    return {
      email: { value: email.value, rules: emailRules },
      password: { value: password.value, rules: passwordRules },
    };
  }
  if (mode.value === "password") {
    return {
      phone: { value: phone.value, rules: phoneRules },
      password: { value: password.value, rules: passwordRules },
    };
  }
  const fields: FieldBag = {
    phone: { value: phone.value, rules: phoneRules },
    sms: { value: sms.value, rules: smsCodeRules },
  };
  if (mode.value === "register") {
    fields.agreed = { value: String(agreed.value), rules: agreeRules };
  }
  return fields;
}

function touch(field: string) {
  const item = currentFields()[field];
  if (!item) return;
  const message = validate(item.value, item.rules);
  if (message) errors.value = { ...errors.value, [field]: message };
  else {
    const next = { ...errors.value };
    delete next[field];
    errors.value = next;
  }
}

function sendCode() {
  if (cooldown.value > 0) return;
  const message = validate(phone.value, phoneRules);
  if (message) {
    errors.value = { ...errors.value, phone: message };
    ElMessage.warning(message);
    return;
  }
  sendSms(phone.value)
    .then(() => {
      ElMessage.success("验证码已发送");
      cooldown.value = 60;
      timer = window.setInterval(() => {
        cooldown.value -= 1;
        if (cooldown.value <= 0 && timer) {
          clearInterval(timer);
          timer = undefined;
        }
      }, 1000);
    })
    .catch(() => {
      /* http 拦截器已提示 */
    });

}

function thirdParty(name: string) {
  ElMessage.info(`本地预览不接入${name}登录`);
}

async function submit() {
  if (submitting.value) return;
  const nextErrors = collectFieldErrors(currentFields());
  errors.value = nextErrors;
  const first = Object.values(nextErrors)[0];
  if (first) {
    ElMessage.warning(first);
    return;
  }
  if (mode.value !== "password") {
    ElMessage.info("当前仅接入手机号密码登录");
    if(mode.value === "code"){
      const data = await loginByPassword(phone.value.trim(), sms.value);
      applyLogin(data, phone.value.trim());
      await fetchMe();
      ElMessage.success("登录成功");
      const redirect = route.query.redirect;
      const target =
          typeof redirect === "string" && redirect.startsWith("/") && !redirect.startsWith("//")
              ? redirect
              : "/home/index";
      await router.push(target);
      return
    }

    return;
  }
  submitting.value = true;
  try {
    const data = await loginByPassword(phone.value.trim(), password.value);
    applyLogin(data, phone.value.trim());
    await fetchMe();
    ElMessage.success("登录成功");
    const redirect = route.query.redirect;
    const target =
      typeof redirect === "string" && redirect.startsWith("/") && !redirect.startsWith("//")
        ? redirect
        : "/home/index";
    await router.push(target);
  } catch {
    /* unwrap 已提示 */
  } finally {
    submitting.value = false;
  }
}

watch(mode, () => {
  errors.value = {};
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

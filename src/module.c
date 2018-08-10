#include <node_api.h>   /* n-api */
#include <sys/time.h>   /* gettimeofday, timeval (for timestamp in microseconds) */

long long int now () {
  struct timeval t_us;
  long long int us;

  if (!gettimeofday(&t_us, NULL)) {
    us = ((long long int) t_us.tv_sec) * 1000000ll +
          (long long int) t_us.tv_usec;
  }
  else return -1ll;

  return us;
}

napi_value MyFunction (napi_env env, napi_callback_info info) {
  napi_status status;

  /* Convert to JS Number the current time in microseconds.
   */
  long long int number = now();
  napi_value myNumber;
  status = napi_create_int64(env, number, &myNumber);
  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to create return value");
  }

  return myNumber;
}

napi_value Init (napi_env env, napi_value exports) {
  napi_status status;
  napi_value fn;

  status = napi_create_function(env, NULL, 0, MyFunction, NULL, &fn);
  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to wrap native function");
  }

  status = napi_set_named_property(env, exports, "gettimeofday", fn);
  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to populate exports");
  }

  return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)

package main

import (
	"fmt"
	"io"
	"net/http"
	"syscall/js"
)

func MyGoFunc() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		// Get the URL as argument
		// args[0] is a js.Value, so we need to get a string out of it
		requestUrl := args[0].String()

		// Handler for the Promise
		// We need to return a Promise because HTTP requests are blocking in Go
		handler := js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			resolve := args[0]
			reject := args[1]

			// Run this code asynchronously
			go func() {
				// Make the HTTP request
				req, err := http.NewRequest("GET", requestUrl, nil)

				if err != nil {
					// Handle errors: reject the Promise if we have an error
					errorConstructor := js.Global().Get("Error")
					errorObject := errorConstructor.New(err.Error())
					reject.Invoke(errorObject)
					return
				}

				// Add CORS headers
				req.Header.Set("Access-Control-Allow-Origin", "*")
				req.Header.Set("Content-Type", "application/json")
				req.Header.Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
				req.Header.Set("Access-Control-Allow-Headers", "Content-Type")

				// Make the HTTP request
				res, err := http.DefaultClient.Do(req)
				if err != nil {
					errorConstructor := js.Global().Get("Error")
					errorObject := errorConstructor.New(err.Error())
					reject.Invoke(errorObject)
					return
				}

				defer res.Body.Close()

				// Read the response body
				data, err := io.ReadAll(res.Body)
				if err != nil {
					// Handle errors here too
					errorConstructor := js.Global().Get("Error")
					errorObject := errorConstructor.New(err.Error())
					reject.Invoke(errorObject)
					return
				}

				// "data" is a byte slice, so we need to convert it to a JS Uint8Array object
				arrayConstructor := js.Global().Get("Uint8Array")
				dataJS := arrayConstructor.New(len(data))
				js.CopyBytesToJS(dataJS, data)

				// Create a Response object and pass the data
				responseConstructor := js.Global().Get("Response")
				response := responseConstructor.New(dataJS)

				// Resolve the Promise
				resolve.Invoke(response)
			}()

			// The handler of a Promise doesn't return any value
			return nil
		})

		// Create and return the Promise object
		promiseConstructor := js.Global().Get("Promise")
		return promiseConstructor.New(handler)
	})
}

func testHelloWorld(this js.Value, args []js.Value) interface{} {
	fmt.Println("Hello from WebAssembly written with Go mothafucka!")
	return nil
}

func main() {
	c := make(chan struct{}, 0)

	// Enregistrer la fonction
	js.Global().Set("testHelloWorld", js.FuncOf(testHelloWorld))
	js.Global().Set("MyGoFunc", MyGoFunc())

	<-c
}

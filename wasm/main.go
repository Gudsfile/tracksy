package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"syscall/js"
)

// Artist represents the data

type Artist struct {
	ID         string   `json:"id"`
	Name       string   `json:"name"`
	Popularity int      `json:"popularity"`
	Genres     []string `json:"genres"`
	Followers  struct {
		Total int `json:"total"`
	} `json:"followers"`
	Images []struct {
		URL    string `json:"url"`
		Height int    `json:"height"`
		Width  int    `json:"width"`
	} `json:"images"`
}

// convertArtistToJS convertit la structure Artist en objet JavaScript
func convertArtistToJS(artist *Artist) map[string]interface{} {
	images := make([]interface{}, len(artist.Images))
	for i, img := range artist.Images {
		images[i] = map[string]interface{}{
			"url":    img.URL,
			"height": img.Height,
			"width":  img.Width,
		}
	}

	return map[string]interface{}{
		"id":         artist.ID,
		"name":       artist.Name,
		"popularity": artist.Popularity,
		"genres":     artist.Genres,
		"followers":  artist.Followers.Total,
		"images":     images,
	}
}

// getArtist récupère les informations d'un artiste depuis l'API Spotify
func getArtist(this js.Value, args []js.Value) interface{} {
	if len(args) != 2 {
		return map[string]interface{}{
			"error": "Requiert 2 arguments: token et artistId",
		}
	}

	token := args[0].String()
	artistID := args[1].String()

	// Préparer l'URL
	url := fmt.Sprintf("https://api.spotify.com/v1/artists/%s", artistID)

	// Créer l'objet Headers via l'API JavaScript
	headers := js.Global().Get("Object").New()
	headers.Set("Authorization", "Bearer "+token)
	headers.Set("Content-Type", "application/json")

	// Créer l'objet options pour fetch
	options := js.Global().Get("Object").New()
	options.Set("method", "GET")
	options.Set("headers", headers)

	// Appeler fetch
	promiseResp := js.Global().Get("fetch").Invoke(url, options)

	// Attendre la réponse
	responseReady := make(chan js.Value)
	promiseResp.Call("then", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		responseReady <- args[0]
		return nil
	}))
	response := <-responseReady

	// Vérifier le status
	if response.Get("status").Int() != http.StatusOK {
		return map[string]interface{}{
			"error": fmt.Sprintf("Erreur API Spotify: %d", response.Get("status").Int()),
		}
	}

	// Obtenir le JSON
	jsonPromise := response.Call("json")
	jsonReady := make(chan js.Value)
	jsonPromise.Call("then", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		jsonReady <- args[0]
		return nil
	}))
	jsonData := <-jsonReady

	// Convertir le JSON en structure Artist
	var artist Artist
	if err := json.Unmarshal([]byte(jsonData.String()), &artist); err != nil {
		return map[string]interface{}{
			"error": fmt.Sprintf("Erreur décodage: %v", err),
		}
	}

	// Convertir et retourner le résultat
	return convertArtistToJS(&artist)
}

func testHelloWorld(this js.Value, args []js.Value) {
	fmt.Println("Hello from WebAssembly written with Go mothafucka!")
}

func main() {
	c := make(chan struct{}, 0)

	// Enregistrer la fonction
	// js.Global().Set("testHelloWorld", js.FuncOf(testHelloWorld))
	js.Global().Set("getSpotifyArtist", js.FuncOf(getArtist))

	<-c
}

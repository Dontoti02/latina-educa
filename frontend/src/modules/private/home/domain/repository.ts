import http from "@/common/http"

class HomeRepository {
    
    readonly #baseUrl = '/home'

    testHttp() {
        return http.get<{student:{name:'andres'}}>(this.#baseUrl + '/test')
    }
    
} 

export default new HomeRepository()

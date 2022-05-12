import React from 'react';
import axios from 'axios';
import '../Search.css';
import Loader from '../loader.gif';
import PageNavigation from './PageNavigation';

class Search extends React.Component  {

    constructor( props ) {
		super( props );
		this.state = {
			query: '',
            results: {},
            loading: false,
            message: '',
            totalResults: 0,
		    totalPages: 0,
		    currentPageNo: 0,
		}

        this.cancel = ''
	}

    getPagesCount = (total, denominator) => {
        const divisible = total % denominator === 0;
        const valueToBeAdded = divisible ? 0 : 1;
        return Math.floor(total / denominator) + valueToBeAdded;
    };

    fetchSearchResults = (updatedPageNo = '', query ) => {
        const pageNumber = updatedPageNo ? `&page=${updatedPageNo}` : '';
        const searchUrl = `http://127.0.0.1:5000${query}${pageNumber}`;
    
        if (this.cancel) {
            this.cancel.cancel();
        }
        this.cancel = axios.CancelToken.source();
        axios.get(searchUrl, {
            cancelToken: this.cancel.token,
        })
            .then((res) => {
                const total = res.data.total;
		        const totalPagesCount = this.getPagesCount( total, 20 );
                const resultNotFoundMsg = !res.data.hits.length
                    ? 'There are no more search results. Please try a new search.'
                    : '';
                this.setState({
                    results: res.data.hits,
                    message: resultNotFoundMsg,
                    totalResults: res.data.total,
			        currentPageNo: updatedPageNo,
			        totalPages: totalPagesCount,
                    loading: false,
                });
            })
            .catch((error) => {
                if (axios.isCancel(error) || error) {
                    this.setState({
                        loading: false,
                        message: 'Failed to fetch results.Please check network',
                    });
                }
            });
    }

    handleOnInputChange = (event) => {
        const query = event.target.value;
        if ( ! query ) {
            this.setState({ query, results: {}, totalResults: 0, totalPages: 0, currentPageNo: 0, message: '' } );
        } else {
            this.setState({ query, loading: true, message: '' }, () => {
                this.fetchSearchResults(1, query);
            });
        }
    };

    handlePageClick = (type, event) => {
        event.preventDefault();
        const updatedPageNo =
                  'prev' === type
                      ? this.state.currentPageNo - 1 : this.state.currentPageNo + 1;
        if (!this.state.loading) {
            this.setState({ loading: true, message: '' }, () => {
                this.fetchSearchResults(updatedPageNo, this.state.query);
            });
        }
    };

    renderSearchResults = () => {
        const {results} = this.state;
        if (Object.keys(results).length && results.length) {
            return (
            <div className="results-container">
                {results.map((result) => {
                    return (
                    <a key={result.id} href={result.previewURL} className="result-items">
                        <h6 className="image-username">{result.user}</h6>
                        <div className="image-wrapper">
                            <img className="image" src={result.previewURL} alt={result.user}/>
                        </div>
                    </a>
                    );
                })}
            </div>
            );
        }
    };

    render() {
        const { query, loading, message, currentPageNo, totalPages } = this.state;
        // showPrevLink will be false, when on the 1st page, hence Prev link be shown on 1st page.
        const showPrevLink = 1 < currentPageNo;
        // showNextLink will be false, when on the last page, hence Next link wont be shown last page.
        const showNextLink = totalPages > currentPageNo;
        return (
            <div className="container"> 
            <h2 className="heading">StackOverflow.com Search</h2>

            <label className="search-label" htmlFor="search-input">
                <input
                type="text"
                name="query"
                value={query}
                id="search-input"
                placeholder="Search here..."
                onChange={this.handleOnInputChange}
                />
                <i className="fa fa-search search-icon"/>
            </label>


            { message && <p className="message">{message}</p> }               
            <img  src={Loader} className={`search-loading ${loading ? 'show' : 'hide' }`}  alt="loader"/>

            <PageNavigation
	            loading={loading}
	            showPrevLink={showPrevLink}
	            showNextLink={showNextLink}
	            handlePrevClick={() => this.handlePageClick('prev')}
	            handleNextClick={() => this.handlePageClick('next')}
            />
            { this.renderSearchResults() }

            <PageNavigation
	            loading={loading}
	            showPrevLink={showPrevLink}
	            showNextLink={showNextLink}
	            handlePrevClick={() => this.handlePageClick('prev')}
	            handleNextClick={() => this.handlePageClick('next')}
            />
            </div>
        )
    }
}

export default Search